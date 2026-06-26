export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone } = req.body;
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Ошибка: Переменные окружения TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в Vercel!');
        return res.status(500).json({ error: 'Server environment misconfigured' });
    }

    const text = `🔥 *Новая заявка с сайта!*\n\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}`;
    const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(TELEGRAM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        const telegramData = await response.json();

        if (response.ok && telegramData.ok) {
            return res.status(200).json({ success: true });
        } else {
            console.error('Telegram API вернул ошибку:', telegramData);
            return res.status(500).json({ 
                error: 'Failed to send to Telegram', 
                telegramError: telegramData.description || 'Unknown error' 
            });
        }
    } catch (error) {
        console.error('Критическая ошибка сети при запросе к Telegram:', error);
        return res.status(500).json({ error: error.message });
    }
}