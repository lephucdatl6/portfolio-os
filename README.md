# Portfolio OS

A Windows-inspired developer portfolio built with React and Vite.

Portfolio OS presents my profile and projects through a desktop-style interface with windows, icons, a taskbar, and lightweight mock-applications. The project showcases UI design, component structure, and interactive state management.

---

## Table of contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech stack](#tech-stack)  
- [Project structure](#project-structure)  
- [Purpose](#purpose)
- [Contact](#contact)

---

## Overview

Portfolio OS simulates a familiar desktop environment to make exploring a portfolio intuitive and engaging. It prioritizes discoverability for non-technical visitors while demonstrating front-end structure and interactions for technical viewers.

Key ideas:
- Desktop metaphors: windows, taskbar, start menu, and icons
- Component-based design for isolated app windows
- Lightweight animations and responsive adjustments for various screen sizes

---

## Features

- Window-based UI: open, close, focus, minimize, and maximize
- Desktop layout with draggable icons and a start menu
- Taskbar that indicates open apps and allows quick focus/restore
- Profile section (about, skills, social links)
- Projects explorer with categorized projects and details
- Resume (PDF) viewer built into a window
- Contact form with mail-to fallback
- Terminal-like interactive sandbox
- Responsive behavior for small screens and touch devices

---

## Tech stack

**Frontend**
- ReactJS
- JavaScript
- HTML & CSS

**Tooling**
- Vite (dev server & build)
- Vercel (Deployment)

---

## Project structure (high level)

```
src/
├─ components/     — reusable UI pieces (Taskbar, StartMenu, Icon, WindowFrame, etc.)
├─ layouts/        — top-level layouts (Desktop layout)
├─ windows/        — window components (Folder, Mail, PDF, etc.)
├─ assets/         — images, icons
├─ App.jsx         — application root and state management
public/
└─ assets/         — static assets served at runtime
```
---

## Purpose

This repository was built to:
- Practice building a React app with interactive UI patterns
- Explore desktop-like interfaces and component composition
- Present projects in an engaging, organized way
- Demonstrate attention to UX details such as focus, stacking, and animations

---
## Contact

Email: pdat.dev@gmail.com
