import Vue from 'vue'
import { accounting } from 'lib/shared'

Vue.config.productionTip = false

window.GobiertoBudgets.ReceiptController = (function() {

  function ReceiptController() {}

  ReceiptController.prototype.show = function(options){
    _receiptCalculator(options);
    _budgetLinesMenu();
  };

  function _budgetLinesMenu() {
    $('.bill_row').on('click', function() {
      $(this)
      .toggleClass('toggled')
      .find('.fas').toggleClass('fa-plus fa-minus')
      .parent().siblings('.children').toggleClass('hidden');
    }).find('.children').click(function() {
      return false;
    });
  }

  function _receiptCalculator(options) {

    new Vue({
      el: '#taxes_receipt',
      name: 'taxes-receipt',
      data: function() {
        return {
          locale: I18n.locale,
          data: options.receiptConfiguration.budgets_simulation_sections || [],
          manual: options.receiptConfiguration.manual_input || false,
          selected: [],
          categories: []
        }
      },
      created: function () {
        // If JSON have options array, and there are several values (years)
        var years = (this.data[0].hasOwnProperty('options') && this.data[0].options.length && typeof this.data[0].options[0].value === 'object')
          ?  _.keys(this.data[0].options[0].value).sort() : [ new Date().getFullYear() ]

        this.categories = (this.manual)
          ? _.takeRight(years) : (years.length > 3)
          ? _.takeRight(years, 3) : years; // Max. 3 years
      },
      filters: {
        format: function (m) {
          return accounting.formatMoney(m, "€", 0, ".", ",").replace(/,0+ €$/, ' €')
        },
        percent: function (value) {
          if (!value) return

          return value.toLocaleString(undefined, {
            style: 'percent'
          })
        }
      },
      directives: {
        focus: {
          // directive definition
          inserted: function(el) {
            el.focus()
          }
        }
      },
      watch: {
        selected: function () {
          // Test if there are negative values
          if (this.selected.some(o => o < 0)) {
            this.selected = this.selected.map(Math.abs)
          }
        }
      },
      methods: {
        total: function(o) {
          return (this.selected.length && typeof this.selected[0] === 'object')
            ? _.sumBy(this.selected, this.categories[o]) : _.sum(this.selected.filter(Number))
        },
        localizedName: function(attr) {
          return attr['name_' + this.locale] || attr['name'];
        },
        ratio: function(percentage) {
          // Last item in array is the newest
          return this.total(this.categories.length - 1) * (percentage/100.0);
        },
        getValue: function (obj, o) {
          if (!obj) return

          return (typeof obj !== 'object')
            ? obj : obj[this.categories[o]]
        },
        getYear: function (o) {
          return this.categories[o] || o
        },
        getDiff: function (obj, p) {
          if (!obj) return

          var self = parseFloat(obj[this.categories[p]]);
          var prev = parseFloat(obj[this.categories[p - 1]]);
          var diff = self - prev;

          return diff / self
        },
        toggleEdit: function(data, force) {
          if (!data) return

          if (data.hasOwnProperty('toggleEdit')) {
            data.toggleEdit = (typeof force === 'undefined') ? !data.toggleEdit : force
          } else {
            this.$set(data, 'toggleEdit', true) // Add reactivity properties dinamically
          }
        }
      }
    });
  }

  return ReceiptController;
})();

window.GobiertoBudgets.receipt_controller = new GobiertoBudgets.ReceiptController;
