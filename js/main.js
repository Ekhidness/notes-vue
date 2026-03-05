new Vue({
    el: '#app',
    data: {
        col1: [],
        col2: [],
        col3: [],
        nextId: 1,
        maxCol1: 3,
        maxCol2: 5
    },
    methods: {
        addCard() {
            if (this.col1.length >= this.maxCol1) return;
            const newCard = {
                id: this.nextId++,
                title: 'Новая карточка',
                items: [
                    { id: this.nextId++, text: '', completed: false },
                    { id: this.nextId++, text: '', completed: false },
                    { id: this.nextId++, text: '', completed: false }
                ]
            };
            this.col1.push(newCard);
        }
    }
});