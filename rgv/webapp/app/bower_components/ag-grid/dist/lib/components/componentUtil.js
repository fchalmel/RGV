/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v15.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("../events");
var propertyKeys_1 = require("../propertyKeys");
var utils_1 = require("../utils");
var ComponentUtil = (function () {
    function ComponentUtil() {
    }
    ComponentUtil.getEventCallbacks = function () {
        if (!ComponentUtil.EVENT_CALLBACKS) {
            ComponentUtil.EVENT_CALLBACKS = [];
            ComponentUtil.EVENTS.forEach(function (eventName) {
                ComponentUtil.EVENT_CALLBACKS.push(ComponentUtil.getCallbackForEvent(eventName));
            });
        }
        return ComponentUtil.EVENT_CALLBACKS;
    };
    ComponentUtil.copyAttributesToGridOptions = function (gridOptions, component) {
        checkForDeprecated(component);
        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {};
        }
        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        var pGridOptions = gridOptions;
        // add in all the simple properties
        ComponentUtil.ARRAY_PROPERTIES
            .concat(ComponentUtil.STRING_PROPERTIES)
            .concat(ComponentUtil.OBJECT_PROPERTIES)
            .concat(ComponentUtil.FUNCTION_PROPERTIES)
            .forEach(function (key) {
            if (typeof component[key] !== 'undefined') {
                pGridOptions[key] = component[key];
            }
        });
        ComponentUtil.BOOLEAN_PROPERTIES.forEach(function (key) {
            if (typeof component[key] !== 'undefined') {
                pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
            }
        });
        ComponentUtil.NUMBER_PROPERTIES.forEach(function (key) {
            if (typeof component[key] !== 'undefined') {
                pGridOptions[key] = ComponentUtil.toNumber(component[key]);
            }
        });
        ComponentUtil.getEventCallbacks().forEach(function (funcName) {
            if (typeof component[funcName] !== 'undefined') {
                pGridOptions[funcName] = component[funcName];
            }
        });
        return gridOptions;
    };
    ComponentUtil.getCallbackForEvent = function (eventName) {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        else {
            return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        }
    };
    // change this method, the caller should know if it's initialised or not, plus 'initialised'
    // is not relevant for all component types. maybe pass in the api and columnApi instead???
    ComponentUtil.processOnChange = function (changes, gridOptions, api, columnApi) {
        //if (!component._initialised || !changes) { return; }
        if (!changes) {
            return;
        }
        checkForDeprecated(changes);
        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        var pGridOptions = gridOptions;
        // check if any change for the simple types, and if so, then just copy in the new value
        ComponentUtil.ARRAY_PROPERTIES
            .concat(ComponentUtil.OBJECT_PROPERTIES)
            .concat(ComponentUtil.STRING_PROPERTIES)
            .forEach(function (key) {
            if (changes[key]) {
                pGridOptions[key] = changes[key].currentValue;
            }
        });
        ComponentUtil.BOOLEAN_PROPERTIES.forEach(function (key) {
            if (changes[key]) {
                pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
            }
        });
        ComponentUtil.NUMBER_PROPERTIES.forEach(function (key) {
            if (changes[key]) {
                pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
            }
        });
        ComponentUtil.getEventCallbacks().forEach(function (funcName) {
            if (changes[funcName]) {
                pGridOptions[funcName] = changes[funcName].currentValue;
            }
        });
        if (changes.showToolPanel) {
            api.showToolPanel(ComponentUtil.toBoolean(changes.showToolPanel.currentValue));
        }
        if (changes.quickFilterText) {
            api.setQuickFilter(changes.quickFilterText.currentValue);
        }
        if (changes.rowData) {
            api.setRowData(changes.rowData.currentValue);
        }
        if (changes.pinnedTopRowData) {
            api.setPinnedTopRowData(changes.pinnedTopRowData.currentValue);
        }
        if (changes.pinnedBottomRowData) {
            api.setPinnedBottomRowData(changes.pinnedBottomRowData.currentValue);
        }
        if (changes.columnDefs) {
            api.setColumnDefs(changes.columnDefs.currentValue);
        }
        if (changes.datasource) {
            api.setDatasource(changes.datasource.currentValue);
        }
        if (changes.headerHeight) {
            api.setHeaderHeight(ComponentUtil.toNumber(changes.headerHeight.currentValue));
        }
        if (changes.paginationPageSize) {
            api.paginationSetPageSize(ComponentUtil.toNumber(changes.paginationPageSize.currentValue));
        }
        if (changes.pivotMode) {
            columnApi.setPivotMode(ComponentUtil.toBoolean(changes.pivotMode.currentValue));
        }
        if (changes.groupRemoveSingleChildren) {
            api.setGroupRemoveSingleChildren(ComponentUtil.toBoolean(changes.groupRemoveSingleChildren.currentValue));
        }
        // copy changes into an event for dispatch
        var event = {
            type: events_1.Events.EVENT_COMPONENT_STATE_CHANGED,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        utils_1.Utils.iterateObject(changes, function (key, value) {
            event[key] = value;
        });
        api.dispatchEvent(event);
    };
    ComponentUtil.toBoolean = function (value) {
        if (typeof value === 'boolean') {
            return value;
        }
        else if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // not value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        }
        else {
            return false;
        }
    };
    ComponentUtil.toNumber = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        else if (typeof value === 'string') {
            return Number(value);
        }
        else {
            return undefined;
        }
    };
    // all the events are populated in here AFTER this class (at the bottom of the file).
    ComponentUtil.EVENTS = [];
    ComponentUtil.STRING_PROPERTIES = propertyKeys_1.PropertyKeys.STRING_PROPERTIES;
    ComponentUtil.OBJECT_PROPERTIES = propertyKeys_1.PropertyKeys.OBJECT_PROPERTIES;
    ComponentUtil.ARRAY_PROPERTIES = propertyKeys_1.PropertyKeys.ARRAY_PROPERTIES;
    ComponentUtil.NUMBER_PROPERTIES = propertyKeys_1.PropertyKeys.NUMBER_PROPERTIES;
    ComponentUtil.BOOLEAN_PROPERTIES = propertyKeys_1.PropertyKeys.BOOLEAN_PROPERTIES;
    ComponentUtil.FUNCTION_PROPERTIES = propertyKeys_1.PropertyKeys.FUNCTION_PROPERTIES;
    ComponentUtil.ALL_PROPERTIES = propertyKeys_1.PropertyKeys.ALL_PROPERTIES;
    return ComponentUtil;
}());
exports.ComponentUtil = ComponentUtil;
utils_1.Utils.iterateObject(events_1.Events, function (key, value) {
    ComponentUtil.EVENTS.push(value);
});
function checkForDeprecated(changes) {
    if (changes.rowDeselected || changes.onRowDeselected) {
        console.warn('ag-grid: as of v3.4 rowDeselected no longer exists. Please check the docs.');
    }
}
