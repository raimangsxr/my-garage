# My Garage 🚗

**My Garage** is a comprehensive Progressive Web App (PWA) designed to serve as your personal vehicle management system. It helps you keep track of every detail of your fleet, from maintenance records and parts to legal documentation and technical specifications.

## ✨ Features

*   **Vehicle Management**: Create and manage detailed profiles for all your vehicles, including photos, VIN, engine details, and more.
*   **Maintenance Timeline**: A visual timeline to track all services, repairs, and upgrades, complete with costs and dates.
*   **Parts & Inventory**: Keep a record of replaced parts, their references, and suppliers.
*   **Torque Specifications**: Store and quickly access torque settings for various vehicle components, with search functionality.
*   **Financial Tracking**: Manage invoices and track expenses for insurance, road tax, and maintenance.
*   **Reminders**: Stay on top of important dates like ITV (inspection), insurance renewal, and road tax payments.
*   **Responsive PWA**: Fully functional on desktop, tablet, and mobile devices with an app-like experience.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Angular 19
*   **UI Library**: Angular Material
*   **Styling**: SCSS with a modern, clean aesthetic
*   **Architecture**: Component-based with standalone components

### Backend
*   **Framework**: FastAPI (Python)
*   **ORM**: SQLModel (combining SQLAlchemy and Pydantic)
*   **Database**: PostgreSQL
*   **Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
*   Node.js 20 LTS & npm
*   Python 3.10+
*   PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd my-garage
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    # Configure .env file with your DATABASE_URL
    uvicorn app.main:app --reload
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:4200`.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
