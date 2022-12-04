import authorsJson from 'authors.json'

/** Return author info, */
export function getAuthor(author: string) {
  const person = authorsJson[author as keyof typeof authorsJson]
  if (!person) {
    console.warn('Invalid author. Did you add it to authors.json??')
    return {
      name: 'Editable Team',
      url: 'https://twitter.com/editablejs',
    }
  }
  return person
}
