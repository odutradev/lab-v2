import { marked } from 'marked'

export const markdownPlugin = () => {
  return (mail: any, callback: (err?: Error | null) => void): void => {
    if (!mail?.data?.markdown || mail.data.html) return callback()

    mail.resolveContent(mail.data, 'markdown', async (err: Error | null, markdownContent: string | Buffer) => {
      if (err) return callback(err)

      try {
        const text = (markdownContent || '').toString()
        const html = await marked.parse(text)
        mail.data.html = html
        if (!mail.data.text) mail.data.text = text
        callback(null)
      } catch (parseError) {
        callback(parseError as Error)
      }
    })
  }
}
