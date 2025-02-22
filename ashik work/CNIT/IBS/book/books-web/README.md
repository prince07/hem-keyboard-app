<div align="center" markdown="1">
<br/>

<img src="https://frappe.io/files/books.png" alt="Frappe Books logo" width="80"/>

<br/>

<h1>Frappe Books Web</h1>

**Modern Accounting Made Simple**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/frappe/books)](https://github.com/frappe/books/releases)
![Platforms](https://img.shields.io/badge/platform-web-yellowgreen)
[![Publish](https://github.com/frappe/books/actions/workflows/publish.yml/badge.svg)](https://github.com/frappe/books/actions/workflows/publish.yml)

</div>

<div align="center">
<img src="https://user-images.githubusercontent.com/29507195/207267857-4ae48890-3fb2-4046-80cf-3256b46c72a0.png" alt="Frappe Books Preview"/>
</div>
<br />
<div align="center">
	<a href="https://frappe.io/books">Website</a>
	-
	<a href="https://docs.frappe.io/books">Documentation</a>
</div>

## Frappe Books Web

This is the web version of Frappe Books, an open-source accounting software aimed at simplifying financial management for businesses. With its clean and user-friendly interface, it streamlines accounting tasks for small and medium-sized enterprises, offering a seamless solution for modern businesses to manage their finances with ease.

## Features

- **Dashboard**: Provides an overview of key financial data and performance metrics
- **Accounts Management**: Create and manage your chart of accounts
- **Party Management**: Manage customers and suppliers
- **Transaction Management**: Record and track all your financial transactions
- **Reports**: Generate essential financial reports like Balance Sheet and Profit & Loss
- **File Management**: Upload and manage documents related to your transactions
- **Multi-User Support**: Multiple users can access the system simultaneously
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- Frontend: Vue.js 3 with TypeScript
- Backend: Express.js with TypeScript
- Database: SQLite3
- Build Tool: Vite
- Styling: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/frappe/books.git
   cd books-web
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

5. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Project Structure

```
books-web/
├── src/                # Frontend source files
│   ├── components/     # Vue components
│   ├── views/         # Vue views/pages
│   ├── router/        # Vue Router configuration
│   └── App.vue        # Root Vue component
├── backend/           # Backend source files
│   ├── database/      # Database management
│   └── routes/        # API routes
├── public/            # Static files
└── dist/             # Build output
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have suggestions, please [open an issue](https://github.com/frappe/books/issues/new).
