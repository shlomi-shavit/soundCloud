'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

document.addEventListener('DOMContentLoaded', function (event) {
    //console.log("ready!");

    // SoundCloud initialize
    SC.initialize({
        client_id: 'EBquMMXE2x5ZxNs9UElOfb4HbvZK95rc'
    });

    /*---- Variables ----*/
    var currentSearch = void 0,
        linkedPartitioning = 0,
        page_size = 6,
        historyArray = [];

    var search_input = document.getElementById('soundCloudSearch'),
        search_result_container = document.querySelector('.sound-cloud__search-results'),
        search_btn = document.querySelector('.sound-cloud__search-btn'),
        navigation_btns = document.querySelector('.sound-cloud__navigation'),
        next_btn = document.querySelector('.sound-cloud__navigation--next'),
        prev_btn = document.querySelector('.sound-cloud__navigation--prev'),
        iframe_container = document.querySelector('.sound-cloud__iframe-container'),
        history_btn = document.querySelector('.sound-cloud__history-btn'),
        clear_history_btn = document.querySelector('.sound-cloud__clear-history-btn'),


    /*---- Functions ----*/
    // Add class function
    addClass = function addClass(elementName, className) {
        elementName.classList.add(className);
    },

    // Remove class function
    removeClass = function removeClass(elementName, className) {
        elementName.classList.remove(className);
    },

    // Cleaning html
    cleanHtml = function cleanHtml(elem) {
        elem.innerHTML = '';
    },

    // increase / decrease linkedPartitioning, return next / prev results according input field typing.
    nextPrev = function nextPrev(linkedPartitioningPara) {
        SC.get('/tracks', {
            q: currentSearch,
            limit: page_size,
            linked_partitioning: linkedPartitioningPara,
            offset: page_size * linkedPartitioning
        }).then(function (tracks) {
            getResult(tracks);
        });
    },

    // Print results
    getResult = function getResult(data) {
        if (data) {
            //console.log('-- Array[' + linkedPartitioning + '] result--', '\n', data, '\n', '--------------------');
            cleanHtml(search_result_container); // Reset input & iframe div's
            cleanHtml(iframe_container); // Reset input & iframe div's

            // Next & Prev buttons, hide & show behavior
            if (data.next_href) {
                addClass(next_btn, 'btn-active');
                if (linkedPartitioning > 0) {
                    addClass(prev_btn, 'btn-active');
                } else {
                    removeClass(prev_btn, 'btn-active');
                }
            } else {
                removeClass(next_btn, 'btn-active');
            }

            // Loop over input value result.
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var _step$value = _slicedToArray(_step.value, 2),
                        index = _step$value[0],
                        value = _step$value[1];

                    // Create DOM <li> & append text
                    var listResult = document.createElement("li"),
                        listText = document.createTextNode(value.title);
                    listResult.appendChild(listText);
                    search_result_container.appendChild(listResult);

                    /*-------- <li> click event --------*/
                    listResult.addEventListener('click', function () {
                        // Embedding track iframe
                        SC.oEmbed(value.uri, { auto_play: true }).then(function (oEmbed) {
                            // Adding & removing fadeAnimation class
                            if (iframe_container.classList.contains('fadeAnimation')) {
                                removeClass(iframe_container, 'fadeAnimation'); // remove class animation
                                setTimeout(function () {
                                    iframe_container.innerHTML = oEmbed.html;
                                    addClass(iframe_container, 'fadeAnimation');
                                }, 700);
                            } else {
                                iframe_container.innerHTML = oEmbed.html;
                                addClass(iframe_container, 'fadeAnimation');
                            }
                        });
                    });
                };

                for (var _iterator = data.collection.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        } else {
            // Reset result div & oEmbed container
            cleanHtml(search_result_container, iframe_container);
            removeClass(iframe_container, 'showImg'); // remove class animation
        }
    },

    // Local storage
    saveDataToLocalStorage = function saveDataToLocalStorage(data) {
        if (data) {
            historyArray = JSON.parse(localStorage.getItem('historyArr')); // Parse the data back into an array
            // Check if history local storage contain new search value
            if (!historyArray.includes(data)) {
                historyArray.length == 5 ? (historyArray.pop(), historyArray.unshift(data)) : historyArray.unshift(data); // limit to 5 & unshift the new data onto array
            }

            localStorage.setItem('historyArr', JSON.stringify(historyArray)); // array to string and store it in localStorage
            removeClass(history_btn, 'disabled'); // show history btn
        } else {
            historyArray.unshift(JSON.parse(localStorage.getItem('historyArr')));
            if (historyArray[0] == null) {
                historyArray = [];
                localStorage.setItem('historyArr', JSON.stringify(historyArray));
            } else {
                removeClass(history_btn, 'disabled');
            }
        }
    };

    /*-------- History searches initialize --------*/
    saveDataToLocalStorage();

    // Click & key events
    /*-------- Search input keys event  --------*/
    search_input.addEventListener('keyup', function (event) {
        if (search_input.value != '' && search_input.value !== currentSearch) {
            // Checking if input vlaue is not empty & equel
            if (event.keyCode === 13) {
                search_btn.click();
            } // 'Enter' key
            removeClass(search_btn, 'disabled');
            addClass(navigation_btns, 'disabled');
        } else {
            addClass(search_btn, 'disabled');
            removeClass(navigation_btns, 'disabled');
        }
    });

    /*-------- Search btn click event --------*/
    search_btn.addEventListener('click', function () {
        linkedPartitioning = 0;
        SC.get('/tracks', {
            q: search_input.value,
            limit: page_size,
            linked_partitioning: linkedPartitioning
        }).then(function (tracks) {
            if (search_input.value !== '') {
                addClass(search_btn, 'disabled');
                removeClass(navigation_btns, 'disabled');
                getResult(tracks);
                currentSearch = search_input.value;
                // Save to localStorage
                saveDataToLocalStorage(search_input.value);
                search_input.value = '';
                addClass(clear_history_btn, 'disabled');
            }
        });
    });

    /*-------- Next btn click event --------*/
    next_btn.addEventListener('click', function () {
        nextPrev(linkedPartitioning++);
    });

    /*-------- Prev btn click event --------*/
    prev_btn.addEventListener('click', function () {
        nextPrev(linkedPartitioning--);
    });

    /*-------- History btn click event --------*/
    history_btn.addEventListener('click', function (event) {
        addClass(navigation_btns, 'disabled');
        cleanHtml(search_result_container); // Reset input & iframe div's
        cleanHtml(iframe_container); // Reset input & iframe div's
        removeClass(iframe_container, 'fadeAnimation'); // remove class animation

        var LH_history_length = JSON.parse(localStorage.historyArr);

        removeClass(clear_history_btn, 'disabled');

        // Loop over history searches.
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = LH_history_length[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _value = _step2.value;


                //Create DOM <li> & append text
                var listResult = document.createElement("li"),
                    listText = document.createTextNode(_value);
                listResult.appendChild(listText);
                search_result_container.appendChild(listResult);

                /*-------- <li> click event --------*/
                listResult.addEventListener('click', function (event) {
                    search_input.value = event.target.innerText;
                    search_btn.click(); //trigger search btn
                });
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    });

    /*-------- Clear history btn click event --------*/
    clear_history_btn.addEventListener('click', function (event) {
        localStorage.clear();
        addClass(clear_history_btn, 'disabled');
        addClass(history_btn, 'disabled');
        cleanHtml(search_result_container);
    });
});

//# sourceMappingURL=script.js.map
