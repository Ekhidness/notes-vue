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
        getCompletionPercentage(card) {
            if (!card.items.length) return 0;
            const completed = card.items.filter(item => item.completed).length;
            return (completed / card.items.length) * 100;
        },
        moveCard(card, fromCol, toCol) {
            const index = this[fromCol].findIndex(c => c.id === card.id);
            if (index !== -1) {
                this[fromCol].splice(index, 1);
                this[toCol].push(card);
            }
        },
        onItemToggle(card) {
            const percentage = this.getCompletionPercentage(card);

            let currentCol = 'col1';
            if (this.col2.includes(card)) currentCol = 'col2';
            if (this.col3.includes(card)) currentCol = 'col3';

            if (percentage === 100) {
                if (currentCol === 'col1' || currentCol === 'col2') {
                    this.moveCard(card, currentCol, 'col3');
                }
            } else if (percentage > 50 && currentCol === 'col1') {
                if (this.col2.length < this.maxCol2) {
                    this.moveCard(card, 'col1', 'col2');
                }
            }
        },
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