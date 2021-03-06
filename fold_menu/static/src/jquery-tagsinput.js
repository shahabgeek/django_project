(function ($) {
  'use strict';

  $.fn.tagsInput = function (options) {
    const settings = $.extend({
      tagClass: 'badge badge-primary',
      tagsContainerClass: 'form-control',
      highlightColor: '#ffc107'
    }, options);

    const ATTR_RENDERED = 'data-rendered';
    const ATTR_DISABLED = 'disabled';
    const TRUE = 'true';
    const helpers = new Helpers();
    const tagRemoveIconTemplate = '<i class="tag-remove">&#10006;</i>';
    const tagTemplate = function(isDisabled) {
      return helpers.fillIn('<div class="tag {tagClass}"><span>{value}</span>{tagRemoveIcon}</div>', {
        'tagClass' : helpers.sanitizeText(settings.tagClass),
        'tagRemoveIcon' : isDisabled? '' : tagRemoveIconTemplate
      });
    }
    const tagsContainerTemplate = function(isDisabled) {
      return helpers.fillIn('<div class="tags-container {tagsContainerClass} {state}"><input type="text" size="1" {state}><div>', {
        'tagsContainerClass' : helpers.sanitizeText(settings.tagsContainerClass),
        'state' : isDisabled? 'disabled' : ''
      });
    }

    /** Render TagsInput elements */
    this.each(function () {
      if (this.hasAttribute(ATTR_RENDERED)) {
        return;
      }

      const isDisabled = this.hasAttribute(ATTR_DISABLED);
      const tTag = tagTemplate(isDisabled);
      const tTagsContainer = tagsContainerTemplate(isDisabled);

      const $that = $(this);
      const tagElems = [];
      const hiddenValue = $that.val();
      if (hiddenValue) {
        $.each(hiddenValue.split(','), function (index, value) {
          const v = value.trim();
          if (v.length > 0) {
            tagElems.unshift(jQuery(tTag.replace('{value}', v)));
          }
        });
      }

      const tagsContainerElem = $(tTagsContainer);
      $.each(tagElems, function (index, value) {
        tagsContainerElem.prepend(value);
      });
      $that.after(tagsContainerElem);
      $that.attr('hidden', TRUE);
      $that.attr(ATTR_RENDERED, TRUE);
      
      
    });

    /** Register events */
    $('i.tag-remove').click(helpers.removeTag);

    $('.tags-container').not('disabled').click(function (e) {
      $(this).children('input').focus();
    });

    $('.tags-container').not('disabled').children('input').bind('input', function (e) {
      helpers.resetSize(this);
    });

    const activeTagTemplate = tagTemplate(false);
    $('.tags-container').not('disabled').children('input').keydown(function (e) {  
      if (e.key === 'Enter' || e.key === ';') {
        e.preventDefault();
        const input = $(e.currentTarget);
        let value = input.val().trim();
        if (value) {
          value = helpers.sanitizeText(value);
          const existingSpan = input.siblings('div').filter(function () {
            return ($(this).find('span').text() === value);
          });
          if (existingSpan.length > 0) {
            if (!settings.hasOwnProperty('tagColor')) {
              settings.tagColor = existingSpan.css('background-color');
            }
            helpers.blink(existingSpan, settings.highlightColor, settings.tagColor);
          } else {
            const newTag = $(activeTagTemplate.replace('{value}', value));
            newTag.insertBefore(input);
            newTag.children('i').click(helpers.removeTag);

            const hiddenInput = $(this).parent().prev();
            let oValue = hiddenInput.val();
            if (oValue.length > 0 && oValue.charAt(oValue.length - 1) != ';') {
              oValue += ';';
            }
            input.val('');
            helpers.resetSize(input);
            hiddenInput.val(oValue.concat(value).concat(';'));
          }
        }
        return false;
      }
    });
  }

  /*** Helper functions declaration ***/
  function Helpers() {}

  Helpers.prototype.resetSize = function (target) {
    const $target = $(target);
    const len = $target.val().length;
    $target.attr('size', (len < 1) ? 1 : len);
  }

  Helpers.prototype.removeTag = function (e) {
    const $that = $(this);
    const parent = $that.parent();
    const hiddenInput = parent.parent().prev();
    const text = $that.siblings('span').text();
    const hValue = hiddenInput.val();
    const pattern =  `(^${text};)|(;${text};)`;
    const result = hValue.replace(new RegExp(pattern, 'u'), ';');
    hiddenInput.val(result);
    parent.remove();
  }

  Helpers.prototype.sanitizeText = function (raw) {
    return $('<div>').text(raw).html();
  }

  Helpers.prototype.blink = function (target, highlightColor, tagColor) {
    const $target = $(target);
    $target.stop().animate({
      backgroundColor: highlightColor
    }, 200).promise().done(function () {
      $target.animate({
        backgroundColor: tagColor
      }, 200);
    });
  }

  Helpers.prototype.fillIn = function(stringTemplate, variables) {
    return stringTemplate.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
        return variables[varName] === undefined? '{'.concat(varName).concat('}') : variables[varName];
    });
}

})(jQuery);