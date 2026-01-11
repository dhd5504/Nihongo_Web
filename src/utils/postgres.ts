import {Pool} from 'pg';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'nihongofe',
    password: '123456',  
});
export default pool;