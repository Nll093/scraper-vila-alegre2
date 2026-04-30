const { chromium } = require('playwright');
const axios = require('axios');
require('dotenv').config();
const cron = require('node-cron');

const LOVABLE_BASE_URL = process.env.LOVABLE_BASE_URL;
const LOVABLE_TOKEN = process.env.LOVABLE_TOKEN;

if (!LOVABLE_BASE_URL || !LOVABLE_TOKEN) {
  console.error('Erro: Configure LOVABLE_BASE_URL e LOVABLE_TOKEN no Railway.');
  process.exit(1);
}

async function scrape() {
  console.log('🚀 Iniciando raspagem do Vila Alegre...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://vilaalegre.com.br/', { waitUntil: 'networkidle' });

  const items = await page.evaluate(() => {
    const products = [];
    const elements = document.querySelectorAll(
      '.product, .item, article, .produto, [class*="produto"], [class*="product"]'
    );

    elements.forEach((el) => {
      const titleEl = el.querySelector('h1, h2, h3, h4, .title, .nome, strong, a');
      const priceEl = el.querySelector('.price, .preco, .valor, [class*="price"], [class*="preco"]');
      const linkEl = el.querySelector('a[href]');

      const title = titleEl?.innerText?.trim();
      const price = priceEl?.innerText?.trim();
      const link = linkEl?.href;

      if (title && price && link) {
        products.push({
          title,
          price,
          link: link.startsWith('http') ? link : new URL(link, window.location.origin).href
        });
      }
    });

    return products.slice(0, 50);
  });

  await browser.close();

  console.log(`📦 Raspados ${items.length} itens.`);

  if (items.length === 0) {
    console.log('⚠️ Nenhum item encontrado.');
    return;
  }

  try {
    const response = await axios.post(
      LOVABLE_BASE_URL,
      { items },
      {
        headers: {
          Authorization: `Bearer ${LOVABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Dados enviados com sucesso! Status: ${response.status}`);
  } catch (err) {
    console.error('❌ Erro ao enviar:', err.message);
  }
}

// Executa imediatamente
scrape();

// Agendado a cada 30 minutos
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ Scraper agendado executando...');
  scrape();
});

console.log('📅 Scraper Vila Alegre ativo. Roda a cada 30 minutos.');
