const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'YourTour API',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'],
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local server',
        },
    ],
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app, port) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}

module.exports = { swaggerUi, swaggerSpec, swaggerDocs };