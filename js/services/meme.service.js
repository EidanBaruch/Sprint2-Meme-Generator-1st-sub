'use strict'

const STORAGE_KEY = 'MemesDB'

const gCategories = ['Sarcastic', 'Animals', 'Babies', 'Cute']

var gMemes

var gCurrImg = 0

_createMemes()


function getMemeCount(filterBy) {
    return _filterMemes(filterBy).length
}

function _filterMemes(filterBy) {
    const txt = filterBy.txt.toLowerCase()
    const rating = filterBy.rating

    const memes = gMemes.filter(meme => 
        meme.category.includes(txt) &&
        meme.rating >= rating)

    return memes
}

function getCategories() {
    return gCategories
}

function removeMeme(memeId) {
    const memeIdx = gCategories.findIndex(meme => memeId === meme.id)
    gCategories.splice(memeIdx, 1)
    
    _saveMemesToStorage()
}

function addMeme(category, rating) {
    var meme = _createMeme(category, rating)
    gMemes.unshift(meme)

    _saveMemesToStorage()
    return meme
}

function getMemeById(memeId) {
    return gMemes.find(meme => memeId === meme.id)
}

function getMemeByURL(memeUrl) {
    return gMemes.find(meme => memeUrl === meme.url)
}

function updateMeme(memeId, newCategory, newRating) {
    const meme = gMemes.find(meme => meme.id === memeId)
    console.log(meme)

    meme.rating = newRating
    meme.category = newCategory

    _saveMemesToStorage()
    return meme
}

function _createMeme(category, rating) {
    return {
        id: makeId(),
        url: getRandUrl(),
        category,
        rating: rating || getRandomIntInclusive(1, 100),
        desc: makeLorem()
    }
}

function _createMemes() {
    gMemes = loadFromStorage(STORAGE_KEY)
    if (gMemes && gMemes.length) return
    
    // If no memes in storage - generate demo data

    gMemes = []
    const categories = ['Sarcastic', 'Animals', 'Babies', 'Cute']
    
    for (let i = 0; i <= 18; i++) {
        var category = categories[getRandomInt(0, categories.length)]
        gMemes.push(_createMeme(category))
    }
    _saveMemesToStorage()
}

function _saveMemesToStorage() {
    saveToStorage(STORAGE_KEY, gMemes)
}

function getMemes(options = {}, numImages) {
    var memes = _filterMemes(options.filterBy)

    if(options.sortBy.rating) {
        memes.sort((meme1, meme2) => (meme1.rating - meme2.rating) * options.sortBy.rating)
    } else if(options.sortBy.category) {
        memes.sort((meme1, meme2) => meme1.category.localeCompare(meme2.category) * options.sortBy.category)
    }

    if(options.page) {
        const startIdx = options.page.idx * options.page.size
        memes = memes.slice(startIdx, startIdx + options.page.size)
    }

    const imgFolder = 'img/'

    for (let i = 1; i <= numImages; i++) {
        const filename = `${i}`
        const url = imgFolder + filename + '.jpg'
        const meme = {
            id: makeId(),
            url,
            category: getRandomKeywords(),
            rating: getRandomIntInclusive(1, 100),
            desc: makeLorem()
        }
        
        memes.push(meme)
    }

    gMemes = memes

    return memes
    
}