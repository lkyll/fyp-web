// api/translate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, source_lang = 'ZH', target_lang = 'EN' } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const apiKey = process.env.DEEPL_API_KEY
    if (!apiKey) {
      throw new Error("Vercel 环境变量 DEEPL_API_KEY 未配置！")
    }

    // 免费版 API 地址和付费版不同
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

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`DeepL API 返回错误: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Translation error:', error)
    // 🚀 把真实的错误信息返回给前端
    res.status(500).json({ 
      error: 'Translation failed', 
      detail: error.message 
    })
  }
}