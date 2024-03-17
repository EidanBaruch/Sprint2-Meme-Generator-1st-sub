'use strict'

const gQueryOptions = {
    filterBy: { txt: '', rating: 60 },
    sortBy: {},
    page: { idx: 0, size: 9 }
}
var gMemeToEdit = null

function onInit() {
    renderCategories()
    readQueryParams()
    renderMemes()
}

function renderMemes() {
    // var memes = getMemes(gQueryOptions)
    var memes = getMemes(gQueryOptions, 18)
    var strHtmls = memes.map(meme => `
        <article class="meme-preview">
            <button title="Delete meme" class="btn-remove" onclick="onRemoveMeme('${meme.id}')">X</button>
            
            <h2>${meme.category}</h2>
            <p>Up to <span>${meme.rating}</span> KMH</p>
            
            <button onclick="onReadMeme('${meme.id}')">Details</button>
            <button onclick="onUpdateMeme('${meme.id}')">Update</button>

            <img title="Photo of ${meme.category}" 
                src="${meme.url}.jpg" 
                alt="Meme category: ${meme.category}"
                onerror="this.src='${meme.url}'">
        </article> 
    `)
    document.querySelector('.memes-container').innerHTML = strHtmls.join('')
}

function renderCategories() {
    const categories = getCategories()
    
    const strHtml = categories.map(category => `
        <option>${category}</option>
    `).join('')

    const elLists = document.querySelectorAll('.categories-list')
    elLists.forEach(list => list.innerHTML += strHtml)
}

// CRUD

function onRemoveMeme(memeId) {
    removeMeme(memeId)
    renderMemes()
    flashMsg(`Meme Deleted`)
}

function onAddMeme() {
    const elModal = document.querySelector('.meme-edit-modal')
    elModal.querySelector('h2').innerText = 'Add Meme'
    elModal.showModal()
}

function onUpdateMeme(memeId) {
    gMemeToEdit = getMemeById(memeId)

    const elModal = document.querySelector('.meme-edit-modal')
    
    const elHeading = elModal.querySelector('h2').innerText = 'Edit Meme'
    const elImg = elModal.querySelector('img').src=`img/${gMemeToEdit.category}.png`
    const elCategories = elModal.querySelector('select').value = gMemeToEdit.category
    const elMaxSpeed = elModal.querySelector('input').value = gMemeToEdit.maxSpeed
    
    elModal.showModal()
}

function onSaveMeme() {
    const elForm = document.querySelector('.meme-edit-modal form')

    const elCategory = elForm.querySelector('select')
    const elMaxSpeed = elForm.querySelector('input')
    
    const category = elCategory.value
    const maxSpeed = elMaxSpeed.value

    // TODO Save the meme
    if(gMemeToEdit) {
        var meme = updateMeme(gMemeToEdit.id, category, rating)
        gMemeToEdit = null
    } else {
        var meme = addMeme(category, rating)
    }
    elForm.reset()

    renderMemes()
    flashMsg(`Meme Saved (id: ${meme.id})`)
}

// Meme Edit Dialog

function onSelectCategory(elCategory) {
    const elMemeImg = document.querySelector('.meme-edit-modal img')
    elMemeImg.src = `img/${elCategory.value}.png`
}

function onCloseMemeEdit() {
    document.querySelector('.meme-edit-modal').close()
}

// Details modal

function onReadMeme(memeId) {
    const meme = getMemeById(memeId)
    const elModal = document.querySelector('.modal')

    elModal.querySelector('h3').innerText = meme.category
    elModal.querySelector('h4 span').innerText = meme.rating
    elModal.querySelector('p').innerText = meme.desc
    elModal.querySelector('img').src = `img/${meme.category}.png`

    elModal.showModal()
}

function onCloseModal() {
    document.querySelector('.modal').close()
}

// Filter, Sort & Pagination

function onSetFilterBy() {
    const elCategory = document.querySelector('.filter-by select')
    const elMinSpeed = document.querySelector('.filter-by input')

    gQueryOptions.filterBy.txt = elCategory.value
    gQueryOptions.filterBy.minSpeed = elMinSpeed.value

    setQueryParams()
    renderMemes()
}

function onSetSortBy() {
    const elSortBy = document.querySelector('.sort-by select')
    const elDir = document.querySelector('.sort-by input')

    const sortBy = elSortBy.value
    const dir = elDir.checked ? -1 : 1

    if(sortBy === 'category'){
        gQueryOptions.sortBy = { category: dir }
    } else if (sortBy === 'rating'){
        gQueryOptions.sortBy = { rating: dir }
    }

    // gQueryOptions.sortBy = { [sortBy]: dir }
    setQueryParams()
    renderMemes()
}

function onNextPage() {
    const memeCount = getMemeCount(gQueryOptions.filterBy)

    // page = { idx: 3, size: 4 } (12)
    
    if(memeCount > (gQueryOptions.page.idx + 1) * gQueryOptions.page.size) {
        gQueryOptions.page.idx++
    } else {
        gQueryOptions.page.idx = 0
    }
    setQueryParams()
    renderMemes()
}

// Query Params

function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)
    
    gQueryOptions.filterBy = {
        txt: queryParams.get('category') || '',
        minSpeed: +queryParams.get('minSpeed') || 0
    }

    if(queryParams.get('sortBy')) {
        const prop = queryParams.get('sortBy')
        const dir = queryParams.get('sortDir')
        gQueryOptions.sortBy[prop] = dir
    }

    if(queryParams.get('pageIdx')) {
        gQueryOptions.page.idx = +queryParams.get('pageIdx')
        gQueryOptions.page.size = +queryParams.get('pageSize')
    }
    renderQueryParams()
}

function renderQueryParams() {
    document.querySelector('.filter-by select').value = gQueryOptions.filterBy.txt
    document.querySelector('.filter-by input').value = gQueryOptions.filterBy.minSpeed
    
    const sortKeys = Object.keys(gQueryOptions.sortBy)
    const sortBy = sortKeys[0]
    const dir = +gQueryOptions.sortBy[sortKeys[0]]

    document.querySelector('.sort-by select').value = sortBy || ''
    document.querySelector('.sort-by input').checked = (dir === -1) ? true : false
}

function setQueryParams() {
    const queryParams = new URLSearchParams()

    queryParams.set('category', gQueryOptions.filterBy.txt)
    queryParams.set('minSpeed', gQueryOptions.filterBy.minSpeed)

    const sortKeys = Object.keys(gQueryOptions.sortBy)
    if(sortKeys.length) {
        queryParams.set('sortBy', sortKeys[0])
        queryParams.set('sortDir', gQueryOptions.sortBy[sortKeys[0]])
    }

    if(gQueryOptions.page) {
        queryParams.set('pageIdx', gQueryOptions.page.idx)
        queryParams.set('pageSize', gQueryOptions.page.size)
    }

    const newUrl = 
        window.location.protocol + "//" + 
        window.location.host + 
        window.location.pathname + '?' + queryParams.toString()

    window.history.pushState({ path: newUrl }, '', newUrl)
}

// UI

function flashMsg(msg) {
    const el = document.querySelector('.user-msg')

    el.innerText = msg
    el.classList.add('open')
    setTimeout(() => el.classList.remove('open'), 3000)
}