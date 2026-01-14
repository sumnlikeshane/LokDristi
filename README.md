<p align="center">
  <img src="src/assets/india.png" alt="LokDristi" width="120" />
</p>

<h1 align="center">LokDristi</h1>

<p align="center">
  <strong>India's Aadhaar Data Visualization & Analytics Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#dataset">Dataset</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Mapbox-GL-000000?style=flat-square&logo=mapbox" alt="Mapbox" />
</p>

---

## Overview

**LokDristi** (Hindi: लोकदृष्टि — "People's Vision") is an interactive data visualization platform analyzing India's Aadhaar ecosystem across enrollment, biometric authentication, and demographic dimensions.

In the last decade, Aadhaar has evolved from a technocratic identity project into one of the most consequential instruments of state capacity in India. It is no longer merely a number—it is *infrastructure*. It mediates welfare delivery, enables financial inclusion, governs authentication for public and private services, and quietly maps the contours of inclusion and exclusion.

This platform provides a deep-dive into **~4.94 million records** and **~124.5 million data points**, spanning **19,742 pincodes** and **68 state/territorial identifiers**—offering researchers, policymakers, and citizens a window into how identity infrastructure shapes governance.

---

## Features

- **Interactive Map Visualization** — Explore Aadhaar data geographically with heatmaps and point layers across India's pincodes
- **Comprehensive Data Insights** — Pre-computed analysis covering enrollment patterns, biometric usage, and demographic distributions
- **Multi-Dataset Analysis** — Cross-reference enrollment, biometric authentication, and demographic data
- **Data Export** — Download individual datasets or complete archives as ZIP files
- **Responsive Design** — Dark-themed, production-grade UI optimized for both desktop and mobile

---

## Dataset

| Dimension | Records | Total Count | Description |
|-----------|---------|-------------|-------------|
| **Enrollment** | 1.0M | 5.43M individuals | Identity capture across age groups |
| **Biometric** | 1.86M | 69.76M authentications | Active service interactions |
| **Demographics** | 2.07M | 49.29M population | Population substrate mapping |

### Key Insights

- **Age Paradox**: 65.25% of enrollments are children (0-5), but adults dominate 50.94% of biometric usage
- **Regional Asymmetry**: North India accounts for ~32% of activity; Northeast remains under-activated at ~4.4%
- **Administrative Core**: Four states (UP, Bihar, MP, Maharashtra) consistently appear in Top 5 across all datasets
- **Youth Indicators**: Ladakh (23.98%) and Dadra & Nagar Haveli (21.71%) show highest youth proportions

---

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox Access Token

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/lokdristi.git
cd lokdristi

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Mapbox token to .env
# VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_MAPBOX_TOKEN` | Mapbox GL JS access token for map rendering |

---

## Usage

### Development

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Data Analysis

The repository includes a Python script for comprehensive dataset analysis:

```bash
# Activate virtual environment (optional)
python -m venv .venv
source .venv/bin/activate

# Run analysis
python scripts/analyze_all_data.py
```

---

## Project Structure

```
lokdristi/
├── public/
│   └── data/
│       ├── enrollment/      # Aadhaar enrollment CSVs
│       ├── biometric/       # Biometric authentication CSVs
│       └── demographics/    # Demographic data CSVs
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React context providers
│   ├── data/                # Data loading & transformation
│   ├── map/                 # Map-related components
│   ├── pages/               # Route pages
│   └── ui/                  # UI elements
├── scripts/                 # Data processing scripts
└── ...config files
```

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7 |
| **Mapping** | Mapbox GL JS, react-map-gl |
| **Styling** | CSS3 with CSS Variables |
| **Data Processing** | PapaParse, JSZip |
| **Icons** | Lucide React |
| **Routing** | React Router DOM 7 |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Data sourced from UIDAI public APIs
- Map tiles provided by Mapbox
- Icons by Lucide

---

<p align="center">
  <sub>Built with purpose. Identity is universal, but usage is uneven and access is conditional.</sub>
</p>
