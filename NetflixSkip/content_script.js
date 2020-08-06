(function () {
    var classList = [
      'nf-flat-button-text'
    ];
  
    var timeoutId;
    var observedSkipBtn;
    var skipBtnObserver;
  

    function existingButtons(classNames) {
      return classNames
        .map(name => {
          return Array.from(document.getElementsByClassName(name)) || [];
        })
        .reduce(function(acc, elems) {
          return acc.concat(elems);
        }, [])
    }
  
    function isBtnVisible(button) {
      return button.offsetParent === null ? false : true;
    }
  
    function triggerClickWhenVisible(button) {
      if (button === observedSkipBtn) {
        return;
      }
  
      var parentWithDisplayStyle = (function() {
        var currentParent = button;
        while (currentParent !== null) {
          if (currentParent.style.display === 'none') {
            return currentParent;
          }
  
          currentParent = currentParent.parentElement;
        }
  
        return null;
      })();
  
      if (!parentWithDisplayStyle) {
        return;
      }

      if (skipBtnObserver && observedSkipBtn) {
        skipBtnObserver.disconnect();
        triggerClick(observedSkipBtn);
      }

      if (!skipBtnObserver) {
        skipBtnObserver = new MutationObserver(function() {
          if (!isBtnVisible(observedSkipBtn)) {
            return;
          }
  
          triggerClick(observedSkipBtn);
          observedSkipBtn = undefined;
          skipBtnObserver.disconnect();
        });
      }

      observedSkipBtn = button;

      skipBtnObserver.observe(parentWithDisplayStyle, { attributes: true });
    }
  
    function checkAndClickButtons() {
      existingButtons(classList).forEach(button => {

        if (!isBtnVisible(button)) {
          triggerClickWhenVisible(button);
          
          return;
        } 
  
        triggerClick(button);
      })
    }
  
    function triggerClick(el) {
      var etype = 'click';
  
      if (typeof el.fireEvent === 'function') {
        el.fireEvent('on' + etype);
      } else if (typeof el.dispatchEvent === 'function') {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
      }
    }
  
    function initObserver() {
      if (!('MutationObserver' in window)) {
        return false;
      }
  
      var ytdPlayer = (function(nodeList) {
        return nodeList && nodeList[0];
      })(document.getElementsByTagName('ytd-player'));
  
      if (!ytdPlayer) {
        return false;
      }
  
      var observer = new MutationObserver(function() {
        checkAndClickButtons();
      });
  
      observer.observe(ytdPlayer, { childList: true, subtree: true });
  
      clearTimeout(timeoutId);
  
      return true;
    } 
  
    function initTimeout() {
      clearTimeout(timeoutId);
  
      if (initObserver()) {
        return;
      }
  

      timeoutId = setTimeout(function() {
        checkAndClickButtons();
  
        initTimeout();
      }, 2000);
    }
  
    var inIframe = (function() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    })();

    if (!inIframe) {
      initTimeout();
    }
  })();