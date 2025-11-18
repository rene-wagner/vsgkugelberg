import slugify from 'slugify'

export class SlugifyService {
  slugify(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      locale: 'de',
    })
  }
}
