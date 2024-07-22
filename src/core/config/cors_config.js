import cors from 'cors';

const cors_options = {
  origin: '*', 
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, 
};

export default cors(cors_options);
