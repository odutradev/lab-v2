import { marked } from 'marked'

type MarkdownMailData = {
  markdown?: unknown
  html?: unknown
  text?: unknown
}

type MarkdownMail = {
  data: MarkdownMailData
  resolveContent: (data: MarkdownMailData, key: string, callback: (error: Error | null, content: string | Buffer) => void) => void
}

export const markdownPlugin = () => {
  return (mail: MarkdownMail, callback: (error?: Error | null) => void): void => {
    if (!mail?.data?.markdown || mail.data.html) return callback()

    mail.resolveContent(mail.data, 'markdown', async (resolveError, markdownContent) => {
      if (resolveError) return callback(resolveError)

      try {
        const text = (markdownContent || '').toString()
        mail.data.html = await marked.parse(text)
        if (!mail.data.text) mail.data.text = text
        callback(null)
      } catch (parseError) {
        callback(parseError as Error)
      }
    })
  }
}
