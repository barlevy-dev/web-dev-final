import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyGram API',
      version: '1.0.0',
      description: 'RESTful API documentation for StudyGram - A platform for students to share academic content',
      contact: {
        name: 'StudyGram Team',
        email: 'support@studygram.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            authProvider: {
              type: 'string',
              enum: ['local', 'google', 'facebook'],
              example: 'local',
            },
            profileImageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://localhost:5000/uploads/profiles/user123/avatar.jpg',
            },
            yearOfStudy: {
              type: 'string',
              example: '3rd Year',
            },
            degree: {
              type: 'string',
              example: 'Computer Science',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            authorName: {
              type: 'string',
              example: 'John Doe',
            },
            title: {
              type: 'string',
              example: 'Introduction to Algorithms',
            },
            content: {
              type: 'string',
              example: 'This is a comprehensive guide to algorithms...',
            },
            courseTag: {
              type: 'string',
              example: 'Computer Science',
            },
            difficultyLevel: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              example: 'medium',
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://localhost:5000/uploads/posts/user123/post-image.jpg',
            },
            likes: {
              type: 'number',
              example: 42,
            },
            likedBy: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
            },
            commentsCount: {
              type: 'number',
              example: 15,
            },
            aiEnhanced: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            postId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            authorName: {
              type: 'string',
              example: 'Jane Smith',
            },
            content: {
              type: 'string',
              example: 'Great explanation! Thanks for sharing.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Posts',
        description: 'Post management endpoints',
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints',
      },
      {
        name: 'AI',
        description: 'AI-powered features',
      },
      {
        name: 'Upload',
        description: 'File upload endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
