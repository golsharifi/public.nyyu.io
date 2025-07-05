# NYYU.io - Public Frontend Repository

This is the public version of the NYYU.io frontend application.

**Source Repository**: Private repository at optitor/nyyu.io  
**Public Mirror**: golsharifi/public.nyyu.io

## About
NYYU.io is a cryptocurrency exchange platform built with:
- **Frontend**: Gatsby.js (React)
- **Styling**: SCSS/CSS
- **State Management**: Redux
- **API**: GraphQL with Apollo Client

## Setup

1. Clone the repository:
```bash
git clone https://github.com/golsharifi/public.nyyu.io.git
cd public.nyyu.io
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

4. Start development server:
```bash
npm run develop
```

## Environment Variables

Copy `.env.example` to `.env.development` and configure:

```bash
GATSBY_API_URL=your-api-url
GATSBY_CLIENT_ID=your-client-id
GATSBY_SECRET=your-secret
GATSBY_ENVIRONMENT=development
```

## Build

```bash
npm run build
```

## Contributing

This is a public mirror of our private repository. 
For contributions, please contact us through our official channels.

## License

© 2024 NYYU. All rights reserved.
