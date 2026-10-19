# Industrial Material Classification Workspace

A web application for managing industrial material classification workflows, built with React, TypeScript, and Siemens iX.

## Live Demo
[Open the application](https://industrial-material-classification-omega.vercel.app/)

## Features
- **Dashboard:** View project statistics, classification statuses, and recent activity.
- **Project Search:** Search projects by project number, name, description, and associated materials.
- **Classification Workspace:** Select and classify materials, with draft autosave to preserve changes.
- **Review & Confirmation:** Review draft classifications before confirming or discarding them.
- **Classification History:** Browse, sort, and filter previous classification records.
- **Excel Export:** Export material data to `.xlsx` files using ExcelJS.
- **Mock API:** Simulate asynchronous requests, loading states, empty results, and errors with retry options.
- **Internationalization:** Switch between English, Turkish, and German.
- **Responsive Layout:** Support desktop and tablet screen sizes.

## Tech Stack
| Technology | Purpose |
| --- | --- |
| React & TypeScript | UI development and type safety |
| Vite | Development server and build tooling |
| Siemens iX | UI components and design system |
| AG Grid React | Tabular data, sorting, and filtering |
| React Router | Navigation and URL-based state |
| i18next & react-i18next | Translations |
| ExcelJS | Excel file generation |
| Vitest | Unit and integration testing |

## Project Structure
```text
src/
├── i18n/          # Translation resources
├── services/      # Mock API and sample data
├── pages/         # Dashboard, workspace, search, history
├── types/         # TypeScript type definitions
├── App.tsx        # Application layout and routing
├── main.tsx       # Application entry point
└── App.css        # Global styles and overrides
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Installation
Clone the repository and install the dependencies:
```bash
git clone [https://github.com/kaanaydnz/industrial-material-classification.git](https://github.com/kaanaydnz/industrial-material-classification.git)
cd industrial-material-classification
npm install
```

Start the development server:
```bash
npm run dev
```
Open the local URL displayed in your terminal, usually `http://localhost:5173`.

### Build
Create a production build:
```bash
npm run build
```

### Tests
Run the available test suite:
```bash
npm run test
```

## Implementation Notes
- **Draft autosave:** Save changes in the background after a short delay to reduce the risk of losing work.
- **URL state:** Keep supported search parameters and navigation state in the URL for easier sharing and navigation.
- **Error handling:** Provide loading, empty, and error states for asynchronous operations.
- **Classification review:** Separate draft editing from confirmation to help prevent unintended changes.
- **Siemens iX:** Use Siemens iX components to maintain a consistent interface across the application.