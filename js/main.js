Vue.component("card-item", {
  props: [
    "item",
    "card",
    "columnType",
    "readonlyText",
    "isBlocked",
    "disabledItems",
  ],
  template: `
        <div class="item">
            <input
                type="checkbox"
                v-model="item.completed"
                @change="$emit('item-toggle', item)"
                :disabled="isBlocked || disabledItems.includes(item.id) || columnType === 'col3' || !canToggle"
            >
            <input
                v-model="item.text"
                :readonly="readonlyText || columnType === 'col3'"
                :disabled="isBlocked || columnType === 'col3'"
                placeholder="Пункт"
            >
            <button
                v-if="!readonlyText && card.items.length > 3 && !isBlocked && columnType === 'col1'"
                @click="$emit('remove-item', item)"
            >-</button>
        </div>
    `,
  computed: {
    canToggle() {
      if (this.item.completed) {
        return false;
      }
      if (!this.item.text || this.item.text.trim() === "") {
        return false;
      }
      return true;
    },
  },
});

Vue.component("card-items", {
  props: [
    "items",
    "card",
    "columnType",
    "readonlyText",
    "isBlocked",
    "disabledItems",
  ],
  components: { "card-item": Vue.options.components["card-item"] },
  template: `
        <div class="items">
            <card-item
                v-for="item in items"
                :key="item.id"
                :item="item"
                :card="card"
                :column-type="columnType"
                :readonly-text="readonlyText"
                :is-blocked="isBlocked"
                :disabled-items="disabledItems"
                @item-toggle="$emit('item-toggle', $event)"
                @remove-item="$emit('remove-item', $event)"
            />
        </div>
    `,
});

Vue.component("card-controls", {
  props: ["itemsLength", "isBlocked", "columnType"],
  template: `
        <div class="item-controls" v-if="!isBlocked && columnType === 'col1'">
            <button
                @click="$emit('add-item')"
                v-if="itemsLength < 5"
            >+ пункт</button>
        </div>
    `,
});

Vue.component("card-header", {
  props: ["title", "readonlyText", "isBlocked", "columnType"],
  template: `
        <input
            v-model="$parent.card.title"
            :readonly="readonlyText || columnType === 'col3'"
            :disabled="isBlocked || columnType === 'col3'"
            placeholder="Заголовок"
        >
    `,
});

Vue.component("card", {
  props: [
    "card",
    "columnType",
    "readonlyText",
    "completed",
    "isBlocked",
    "disabledItems",
  ],
  components: {
    "card-header": Vue.options.components["card-header"],
    "card-items": Vue.options.components["card-items"],
    "card-controls": Vue.options.components["card-controls"],
  },
  template: `
        <div :class="['card', { completed: completed }]">
            <template v-if="completed">
                <h3>{{ card.title }}</h3>
                <ul>
                    <li v-for="item in card.items" :key="item.id">{{ item.text }}</li>
                </ul>
                <div class="completed-date">{{ card.completedDate }}</div>
            </template>

            <template v-else>
                <card-header
                    :title="card.title"
                    :readonly-text="readonlyText"
                    :is-blocked="isBlocked"
                    :column-type="columnType"
                />

                <card-items
                    :items="card.items"
                    :card="card"
                    :column-type="columnType"
                    :readonly-text="readonlyText"
                    :is-blocked="isBlocked"
                    :disabled-items="disabledItems"
                    @item-toggle="$emit('item-toggle', $event)"
                    @remove-item="$emit('remove-item', $event)"
                />

                <card-controls
                    :items-length="card.items.length"
                    :is-blocked="isBlocked"
                    :column-type="columnType"
                    @add-item="$emit('add-item')"
                />
            </template>
        </div>
    `,
});

Vue.component("add-button", {
  props: ["disabled"],
  template: `
        <button
            @click="$emit('click')"
            :disabled="disabled"
        >Добавить карточку</button>
    `,
});

Vue.component("column", {
  props: [
    "title",
    "cards",
    "maxCards",
    "columnType",
    "isBlocked",
    "readonlyText",
    "completed",
    "disabledItems",
  ],
  components: {
    card: Vue.options.components["card"],
    "add-button": Vue.options.components["add-button"],
  },
  template: `
        <div class="column">
            <h2>{{ title }} <span v-if="maxCards">(≤{{ maxCards }})</span></h2>

            <add-button
                v-if="columnType === 'col1'"
                :disabled="cards.length >= maxCards || isBlocked"
                @click="$emit('add-card')"
            />

            <div class="cards">
                <card
                    v-for="card in cards"
                    :key="card.id"
                    :card="card"
                    :column-type="columnType"
                    :readonly-text="readonlyText"
                    :completed="completed"
                    :is-blocked="isBlocked"
                    :disabled-items="disabledItems"
                    @item-toggle="$emit('item-toggle', $event)"
                    @add-item="$emit('add-item', card)"
                    @remove-item="$emit('remove-item', card, $event)"
                />
            </div>
        </div>
    `,
});

new Vue({
  el: "#app",
  template: `
        <div>
            <h1>Заметочки</h1>
            <div class="columns">
                <column
                    title="Новое"
                    :cards="col1"
                    :max-cards="maxCol1"
                    :is-blocked="isCol1Blocked"
                    :disabled-items="disabledItems"
                    column-type="col1"
                    @add-card="addCard"
                    @item-toggle="onItemToggle"
                    @add-item="addItem"
                    @remove-item="removeItem"
                />

                <column
                    title="В процессе"
                    :cards="col2"
                    :max-cards="maxCol2"
                    column-type="col2"
                    :readonly-text="true"
                    :disabled-items="disabledItems"
                    @item-toggle="onItemToggle"
                />

                <column
                    title="Завершено"
                    :cards="col3"
                    column-type="col3"
                    :completed="true"
                />
            </div>
        </div>
    `,
  data: {
    col1: [],
    col2: [],
    col3: [],
    nextId: 1,
    maxCol1: 3,
    maxCol2: 5,
    disabledItems: [],
  },
  computed: {
    isCol1Blocked() {
      return (
        this.col2.length === this.maxCol2 &&
        this.col1.some(
          (card) =>
            this.getCompletionPercentage(card) > 50 &&
            this.getCompletionPercentage(card) < 100,
        )
      );
    },
  },
  watch: {
    col1: { handler: "saveToLocalStorage", deep: true },
    col2: { handler: "saveToLocalStorage", deep: true },
    col3: { handler: "saveToLocalStorage", deep: true },
  },
  mounted() {
    this.loadFromLocalStorage();
  },
  methods: {
    getCompletionPercentage(card) {
      if (!card.items.length) return 0;
      const completed = card.items.filter((item) => item.completed).length;
      return (completed / card.items.length) * 100;
    },
    moveCard(card, fromCol, toCol) {
      const index = this[fromCol].findIndex((c) => c.id === card.id);
      if (index !== -1) {
        this[fromCol].splice(index, 1);
        this[toCol].push(card);
      }
    },
    processQueueFromCol1() {
      const candidates = this.col1.filter(
        (card) =>
          this.getCompletionPercentage(card) > 50 &&
          this.getCompletionPercentage(card) < 100,
      );
      for (let card of candidates) {
        if (this.col2.length < this.maxCol2) {
          this.moveCard(card, "col1", "col2");
        } else {
          break;
        }
      }
    },
    onItemToggle(item) {
      if (this.disabledItems.includes(item.id)) return;

      this.disabledItems.push(item.id);

      let card = null;
      let currentCol = "col1";

      for (let c of this.col1) {
        if (c.items.includes(item)) {
          card = c;
          currentCol = "col1";
          break;
        }
      }
      if (!card) {
        for (let c of this.col2) {
          if (c.items.includes(item)) {
            card = c;
            currentCol = "col2";
            break;
          }
        }
      }

      if (!card) {
        const index = this.disabledItems.indexOf(item.id);
        if (index !== -1) this.disabledItems.splice(index, 1);
        return;
      }

      const percentage = this.getCompletionPercentage(card);

      if (percentage === 100) {
        if (currentCol === "col1" || currentCol === "col2") {
          card.completedDate = new Date().toLocaleString();
          this.moveCard(card, currentCol, "col3");
          if (currentCol === "col2") this.processQueueFromCol1();
        }
      } else if (percentage > 50 && currentCol === "col1") {
        if (this.col2.length < this.maxCol2) {
          this.moveCard(card, "col1", "col2");
        }
      }

      setTimeout(() => {
        const index = this.disabledItems.indexOf(item.id);
        if (index !== -1) this.disabledItems.splice(index, 1);
      }, 300);
    },
    addCard() {
      if (this.col1.length >= this.maxCol1) return;
      const newCard = {
        id: this.nextId++,
        title: "Новая карточка",
        items: [
          { id: this.nextId++, text: "", completed: false },
          { id: this.nextId++, text: "", completed: false },
          { id: this.nextId++, text: "", completed: false },
        ],
        completedDate: null,
      };
      this.col1.push(newCard);
    },
    addItem(card) {
      if (card.items.length < 5) {
        card.items.push({ id: this.nextId++, text: "", completed: false });
      }
    },
    removeItem(card, item) {
      if (card.items.length > 3) {
        const index = card.items.findIndex((i) => i.id === item.id);
        if (index !== -1) card.items.splice(index, 1);
      }
    },
    saveToLocalStorage() {
      const data = {
        col1: this.col1,
        col2: this.col2,
        col3: this.col3,
        nextId: this.nextId,
      };
      localStorage.setItem("notes-app-data", JSON.stringify(data));
    },
    loadFromLocalStorage() {
      const saved = localStorage.getItem("notes-app-data");
      if (saved) {
        const data = JSON.parse(saved);
        this.col1 = data.col1 || [];
        this.col2 = data.col2 || [];
        this.col3 = data.col3 || [];
        this.nextId = data.nextId || 1;
      }
    },
  },
});
