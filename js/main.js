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
        },
        addItem(card) {
            if (card.items.length < 5) {
                card.items.push({ id: this.nextId++, text: '', completed: false });
            }
        },
        removeItem(card, item) {
            if (card.items.length > 3) {
                const index = card.items.findIndex(i => i.id === item.id);
                if (index !== -1) card.items.splice(index, 1);
            }
        }
    }
});