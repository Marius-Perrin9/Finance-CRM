# Marius Perrin CRM

## Why I built this

I am a French business school student at NEOMA, with a background that is probably not the most obvious one for building a web application. Before business school, I spent three years studying humanities in *classe préparatoire littéraire*, and I later developed a strong interest in financial markets, especially structured products and sales.

After discovering structured products more closely through professional experience and spending time around a sales and trading desk, I realized that what attracts me most about finance is not only the products themselves, but also the human side of the job: understanding clients, building relationships and turning complex financial solutions into something useful for them.

I wanted to combine this interest with another question I have been exploring: how far can I use AI to build things myself, even without a traditional technical background?

This CRM is my first experiment.

## The idea

I imagined a simple CRM from the perspective of a structured products salesperson.

Instead of building a generic contact database, I wanted the information to reflect the way I understand the job: who the client is, what type of products they are interested in, when I last spoke to them and when I should contact them again.

The prototype therefore allows me to track:

- client type, such as Private Bank, Asset Manager, Family Office or Wealth Manager;
- product interest, including Autocall, Reverse Convertible and Capital Protected products;
- prospect and client status;
- last contact and next follow-up;
- notes and contact information;
- prospect search, filtering and CSV export.

## How I built it

I am not a software developer and I did not write this application from scratch.

I built it with VS Code and GitHub Copilot, starting from the business idea and progressively defining what I wanted the application to do, testing it, identifying what was missing and adapting it to a structured products sales use case.

For me, that is precisely the point of the project. I wanted to understand how AI can allow someone with business and financial knowledge to turn an idea into a working prototype without pretending to have a technical background that I do not have.

This is a small first project, but it made me want to keep exploring the intersection between finance, sales, technology and AI.

## Technical note

The current version is a front-end prototype built with HTML, CSS and JavaScript. Data is stored locally in the browser using `localStorage`, so no sensitive or real client information should be entered.
