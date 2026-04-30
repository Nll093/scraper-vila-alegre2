# Scraper Vila Alegre

Este projeto coleta dados simples do site Vila Alegre usando Playwright
e envia para a API definida via variáveis LOVABLE_BASE_URL e LOVABLE_TOKEN.

## Execução no Railway
- O Playwright é instalado automaticamente
- O scraper roda imediatamente ao iniciar
- Depois repete a cada 30 minutos via cron

## Variáveis necessárias
- LOVABLE_BASE_URL
- LOVABLE_TOKEN
