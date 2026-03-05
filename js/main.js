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
    computed: {
        isCol1Blocked() {
            return this.col2.length === this.maxCol2 && this.col1.some(card =>
                this.getCompletionPercentage(card) > 50 && this.getCompletionPercentage(card) < 100
            );
        }
    },
    watch: {
        col1: { handler: 'saveToLocalStorage', deep: true },
        col2: { handler: 'saveToLocalStorage', deep: true },
        col3: { handler: 'saveToLocalStorage', deep: true }
    },
    mounted() {
        this.loadFromLocalStorage();
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
        processQueueFromCol1() {
            const candidates = this.col1.filter(card =>
                this.getCompletionPercentage(card) > 50 && this.getCompletionPercentage(card) < 100
            );
            for (let card of candidates) {
                if (this.col2.length < this.maxCol2) {
                    this.moveCard(card, 'col1', 'col2');
                } else {
                    break;
                }
            }
        },
        onItemToggle(card) {
            const percentage = this.getCompletionPercentage(card);

            let currentCol = 'col1';
            if (this.col2.includes(card)) currentCol = 'col2';
            if (this.col3.includes(card)) currentCol = 'col3';

            if (percentage === 100) {
                if (currentCol === 'col1' || currentCol === 'col2') {
                    card.completedDate = new Date().toLocaleString();
                    this.moveCard(card, currentCol, 'col3');
                    if (currentCol === 'col2') this.processQueueFromCol1();
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
                ],
                completedDate: null
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
        },
        saveToLocalStorage() {
            const data = {
                col1: this.col1,
                col2: this.col2,
                col3: this.col3,
                nextId: this.nextId
            };
            localStorage.setItem('notes-app-data', JSON.stringify(data));
        },
        loadFromLocalStorage() {
            const saved = localStorage.getItem('notes-app-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.col1 = data.col1 || [];
                this.col2 = data.col2 || [];
                this.col3 = data.col3 || [];
                this.nextId = data.nextId || 1;
            }
        }
    }
});