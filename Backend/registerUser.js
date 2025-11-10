import { hash } from 'bcrypt';

async function registerUser(pool, formData) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const hashedPassword = await hash(formData.password, 10);

        const existing = await client.query('SELECT * FROM sales_person WHERE email_id = $1', [formData.emailId]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return { status: 400, error: 'Email already registered' };
        }

        const userQuery = `INSERT INTO sales_person (name, email_id, password) VALUES ($1, $2, $3) RETURNING user_id`;
        const result = await client.query(userQuery, [formData.name, formData.emailId, hashedPassword]);

        const userId = result.rows[0].user_id;

        const contactQuery = `INSERT INTO contact_details (user_id, contact_number) SELECT $1, * FROM UNNEST($2::text[])`;
        await client.query(contactQuery, [userId, formData.contacts]);

        const addressQuery = `INSERT INTO address_details (user_id, street, city, pincode) SELECT $1, * FROM UNNEST($2::text[], $3::text[], $4::text[])`;
        await client.query(addressQuery, [
            userId,
            formData.addresses.map((address) => address.street),
            formData.addresses.map((address) => address.city),
            formData.addresses.map((address) => address.pincode),
        ]);

        await client.query('COMMIT');
        return { status: 201, userId, message: 'User created!' };
    }

    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return { status: 500, error: 'Database Error' };
    }

    finally {
        client.release();
    }
}

export default registerUser;