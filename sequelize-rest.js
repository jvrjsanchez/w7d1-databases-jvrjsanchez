require('dotenv').config();
const { Sequelize, Model, DataTypes } = require('sequelize');
const express = require('express');
const app = express();

app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
});

class Movie extends Model {}

Movie.init({
    title: DataTypes.STRING,
    yearOfRelease: DataTypes.INTEGER,
    synopsis: DataTypes.TEXT,
}, { sequelize, modelName: 'movie' });

sequelize.sync().then(() => {
    console.log('Database synced');
    Movie.bulkCreate([
        { title: 'The Shawshank Redemption', yearOfRelease: 1994, synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.' },
        { title: 'The Godfather', yearOfRelease: 1972, synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
        { title: 'The Dark Knight', yearOfRelease: 2008, synopsis: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.' },
    ]).then(() => console.log('Initial movies added'));
}).catch(err => console.error('Syncing with database failed:', err));


app.post('/movies', async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).send(movie);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/movies', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0; 

    try {
        const { count, rows } = await Movie.findAndCountAll({ limit, offset });
        res.send({ data: rows, total: count });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            res.send(movie);
        } else {
            res.status(404).send({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.put('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            await movie.update(req.body);
            res.send(movie);
        } else {
            res.status(404).send({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.delete('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            await movie.destroy();
            res.status(204).send();
        } else {
            res.status(404).send({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Server for Sequelize REST API is running on port 3001');
});
