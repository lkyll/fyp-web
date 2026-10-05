// api/translate.js
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, source_lang = 'ZH', target_lang = 'EN' } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    // 从 Vercel 环境变量中读取 DEEPL_API_KEY
    const apiKey = process.env.DEEPL_API_KEY
    
    // 判断是否为免费版 API（以 :fx 结尾）
    const url = apiKey.endsWith(':fx') 
      ? 'https://api-free.deepl.com/v2/translate' 
      : 'https://api.deepl.com/v2/translate'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        source_lang,
        target_lang
      })
    })

    if (!response.ok) throw new Error(`DeepL API error: ${response.status}`)

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ error: 'Translation failed' })
  }
}