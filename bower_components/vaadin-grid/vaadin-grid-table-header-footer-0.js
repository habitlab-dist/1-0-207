
  (function() {

    /**
     * @polymerBehavior vaadinGridTableRowContainerBehavior
     */
    var vaadinGridTableRowContainerBehavior = {
      properties: {
        columnTree: Array,
        target: Object,
        _rows: Array
      },

      observers: ['_columnTreeChanged(columnTree, target)', '_rowsChanged(_rows)'],

      _columnTreeChanged: function(columnTree, target) {
        if (this._rows) {
          this._rows.forEach(function(row) {
            Polymer.dom(row).innerHTML = '';
          });
        }

        var rows = [];
        for(var i = 0; i < columnTree.length; i++) {
          var row = this._createRow();
          row.target = target;
          row._isColumnRow = i == columnTree.length - 1;
          row.columns = columnTree[i];
          rows.push(row);
        }

        this._rows = this.localName === 'thead' ? rows : rows.reverse();
      },

      _rowsChanged: function(rows) {
        Polymer.dom(this).innerHTML = '';

        rows.forEach(function(row) {
          Polymer.dom(this).appendChild(row);
        }.bind(this));
      }
    };

    Polymer({
      is: 'vaadin-grid-table-header',
      extends: 'thead',
      behaviors: [vaadinGridTableRowContainerBehavior,
        vaadin.elements.grid.FocusableCellContainerBehavior],

      _createRow: function() {
        return document.createElement('tr', 'vaadin-grid-table-header-row');
      }
    });

    Polymer({
      is: 'vaadin-grid-table-body',
      extends: 'tbody',
      behaviors: [vaadin.elements.grid.FocusableCellContainerBehavior],

      observers: ['_announceFocusedRow(_focusedRow)'],

      _announceFocusedRow: function(row) {
        this.fire('iron-announce', {
          text: 'Row ' + (row.index + 1) + ' of ' + this.domHost.size
        });
      },

      _moveFocusToDetailsCell: function() {
        this._focusedCell.focused = false;
        this._focusedRow._rowDetailsCell.focused = true;
        this._focusedCell = this._focusedRow._rowDetailsCell;
      },

      _focusedRowHasDetailsCell: function() {
        return this._focusedRow &&
          this._focusedRow._rowDetailsCell &&
          this._focusedCell !== this._focusedRow._rowDetailsCell;
      },

      focusDown: function() {
        if (this._focusedRowHasDetailsCell()) {
          this._moveFocusToDetailsCell();
        } else {
          this._focusedRowIndex = Math.min(this._focusedRowIndex + 1, this.domHost.size - 1);
        }
      },

      focusUp: function() {
        if (this._focusedRow &&
          this._focusedCell === this._focusedRow._rowDetailsCell) {
          this._focusedCellChanged(this._focusedRowIndex, this._focusedCellIndex);
        } else {
          this._focusedRowIndex = Math.max(0, this._focusedRowIndex - 1);

          if (this._focusedRowHasDetailsCell()) {
            this._moveFocusToDetailsCell();
          }
        }
      },

      focusLast: function() {
        this._focusedRowIndex = this.domHost.size - 1;
        this.focusEnd();
      },

      _focusedCellChanged: function(rowIndex, cellIndex) {
        Polymer.dom(this).children.forEach(function(row) {
          row.focused = row.index === rowIndex;

          if (row.index === rowIndex) {
            this._focusedRow = row;
            this._focusedCell = row.children[cellIndex];
          }

          row.iterateCells(function(cell, idx) {
            cell.focused = idx === cellIndex;
          });
        }.bind(this));
      }
    });

    Polymer({
      is: 'vaadin-grid-table-footer',
      extends: 'tfoot',
      behaviors: [vaadinGridTableRowContainerBehavior,
        vaadin.elements.grid.FocusableCellContainerBehavior],

      _createRow: function() {
        return document.createElement('tr', 'vaadin-grid-table-footer-row');
      }
    });
  })();
