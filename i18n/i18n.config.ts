import en from './locales/en.json'
import uk from './locales/uk.json'
import ru from './locales/ru.json'

export default defineI18nConfig(() => {
    return {
        legacy: false,
        messages: {
            en,
            uk,
            ru
        }
    }
})
