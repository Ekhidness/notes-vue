Vue.component("sub-item", {
  props: ["sub", "readonly", "isBlocked"],
  template: `
    <div class="sub-item">
      <input type="checkbox" v-model="sub.completed" @change="$emit('change')" :disabled="readonly || isBlocked">
      <input type="text" v-model="sub.text" :readonly="readonly" :disabled="isBlocked" placeholder="подпункт">
      <button @click="$emit('remove')" v-if="!readonly && !isBlocked">-</button>
    </div>
  `,
});

Vue.component("card-item", {
  props: [
    "item",
    "card",
    "columnType",
    "readonlyText",
    "isBlocked",
    "disabledItems",
  ],
  components: { "sub-item": Vue.options.components["sub-item"] },
  data() {
    return {};
  },
  computed: {
    hasSubs() {
      return this.item.subitems && this.item.subitems.length > 0;
    },
    allSubDone() {
      return this.hasSubs && this.item.subitems.every((s) => s.completed);
    },
  },
  methods: {
    addSubItem() {
      if (!this.item.subitems) this.$set(this.item, "subitems", []);
      if (this.item.subitems.length < 7) {
        this.item.subitems.push({
          id: Date.now() + Math.random(),
          text: "",
          completed: false,
        });
      }
    },
    removeSubItem(sub) {
      const idx = this.item.subitems.indexOf(sub);
      if (idx !== -1) this.item.subitems.splice(idx, 1);
      this.updateParent();
    },
    onSubChange() {
      this.updateParent();
    },
    updateParent() {
      const newVal = this.allSubDone;
      if (this.item.completed !== newVal) {
        this.item.completed = newVal;
        this.$emit("item-toggle", this.item);
      }
    },
    onParentChange(e) {
      if (this.hasSubs) {
        alert("Сначала выполните все подпункты");
        this.$nextTick(() => {
          e.target.checked = this.item.completed;
        });
        return;
      }
      this.item.completed = e.target.checked;
      this.$emit("item-toggle", this.item);
    },
  },
  template: `
    <div class="item-wrapper">
      <div class="item">
        <input
            type="checkbox"
            :checked="item.completed"
            @change="onParentChange"
            :disabled="isBlocked || disabledItems.includes(item.id) || columnType === 'col3'"
        >
        <input
            v-model="item.text"
            :readonly="readonlyText || columnType === 'col3'"
            :disabled="isBlocked || columnType === 'col3'"
            placeholder="Пункт"
        >
        <button
            @click="addSubItem"
            v-if="!readonlyText && !isBlocked && (!item.subitems || item.subitems.length < 7) && columnType === 'col1'"
            title="Добавить подпункт"
        >+подпункт</button>
        <button
            v-if="!readonlyText && card.items.length > 3 && !isBlocked && columnType === 'col1'"
            @click="$emit('remove-item', item)"
        >-</button>
      </div>
      <div v-if="hasSubs" class="sub-items">
        <sub-item
            v-for="sub in item.subitems"
            :key="sub.id"
            :sub="sub"
            :readonly="readonlyText || isBlocked"
            @change="onSubChange"
            @remove="removeSubItem(sub)"
        />
      </div>
    </div>
  `,
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
    "preview",
    "column",
  ],
  components: {
    "card-header": Vue.options.components["card-header"],
    "card-items": Vue.options.components["card-items"],
    "card-controls": Vue.options.components["card-controls"],
  },
  computed: {
    status() {
      if (this.card.completedDate) return "Выполнена";
      if (this.column === "col2") return "В процессе";
      return "Новая";
    },
  },
  template: `
        <div v-if="preview" class="card preview">
            <div class="card-header">
                <span class="card-date">Создано: {{ card.createdDate }}</span>
                <span v-if="card.editedDate" class="edited-date">(ред. {{ card.editedDate }})</span>
            </div>
            <h3>{{ card.title }}</h3>
            <ul class="preview-items">
                <li v-for="item in card.items" :key="item.id" :class="{ completed: item.completed }">
                    <span v-if="item.completed">✓</span> {{ item.text }}
                    <ul v-if="item.subitems && item.subitems.length" class="preview-subs">
                        <li v-for="sub in item.subitems" :key="sub.id" :class="{ completed: sub.completed }">
                            <span v-if="sub.completed">✓</span> {{ sub.text }}
                        </li>
                    </ul>
                </li>
            </ul>
            <div v-if="card.completedDate" class="completed-date">Завершена: {{ card.completedDate }}</div>
            <div class="card-status">Статус: {{ status }}</div>
        </div>
        <div v-else :class="['card', { completed: completed }]">
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
            class="add-card-btn"
        >+ Добавить карточку</button>
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
            <h2>{{ title }}</h2>

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

            <div class="search-section">
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Поиск по названиям..."
                    class="search-input"
                />
                <div v-if="searchQuery && filteredCards.length" class="search-results">
                    <h3>Результаты поиска ({{ filteredCards.length }})</h3>
                    <div class="results-grid">
                        <card
                            v-for="item in filteredCards"
                            :key="item.card.id"
                            :card="item.card"
                            :column="item.col"
                            :preview="true"
                        />
                    </div>
                </div>
                <div v-else-if="searchQuery && !filteredCards.length" class="no-results">
                    Ничего не найдено
                </div>
            </div>

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
    searchQuery: "",
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
    filteredCards() {
      if (!this.searchQuery) return [];
      const query = this.searchQuery.toLowerCase();
      const all = [
        ...this.col1.map((card) => ({ card, col: "col1" })),
        ...this.col2.map((card) => ({ card, col: "col2" })),
        ...this.col3.map((card) => ({ card, col: "col3" })),
      ];
      return all.filter((item) =>
        item.card.title.toLowerCase().includes(query),
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
          { id: this.nextId++, text: "", completed: false, subitems: [] },
          { id: this.nextId++, text: "", completed: false, subitems: [] },
          { id: this.nextId++, text: "", completed: false, subitems: [] },
        ],
        createdDate: new Date().toLocaleString(),
        editedDate: null,
        completedDate: null,
      };
      this.col1.push(newCard);
    },
    addItem(card) {
      if (card.items.length < 5) {
        card.items.push({
          id: this.nextId++,
          text: "",
          completed: false,
          subitems: [],
        });
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
