(function ($) {
    "use strict";

    var methods = {
        init: function (params) {
            const defaults = $.fn.colorPalettePicker.defaults;
            if (params.bootstrap == 3) {
                $(this).addClass('dropdown');
                defaults.buttonClass = 'btn btn-default dropdown-toggle';
                defaults.button = '<button id="colorpaletterbuttonid" name="colorpalettebutton" class="{buttonClass}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{buttonText} <span class="caret"></span></button>';
                defaults.dropdown = '<ul class="dropdown-menu" aria-labelledby="colorpaletterbuttonid">';
                defaults.menu = '<ul class="list-inline">';
                defaults.item = '<li><div name="picker_{name}" style="background-color:{color};width:16px;height:16px;border:1px solid #eee;margin:0px;cursor:pointer" title="{name}" data-color="{color}"></div></li>';
            }
            const options = $.extend({}, defaults, params);

            // button configuration
            const btn = $(options.button
                .replace('{buttonText}', options.buttonText)
                .replace('{buttonClass}', options.buttonClass));
            $(this).html(btn);
            // dropdown configuration
            const dropdown = $(options.dropdown.replace('{dropdownTitle}', options.dropdownTitle));
            // check if colors passed throught data-colors
            const dataColors = $(this).attr('data-colors');
            if (dataColors != undefined) {
                options.palette = dataColors.split(',');
            }
            // check if lines passed throught data-lines
            const dataLines = $(this).attr('data-lines');
            if (dataLines != undefined)
                options.lines = dataLines;
            // calculating items per line
            const paletteLength = options.palette.length;
            const itemsPerLine = 7;
            let paletteIndex = 0;
            for (let i = 0; i < options.lines; i++) {
                const menu = $(options.menu);

                for (let j = 0; j < itemsPerLine; j++) {
                    const paletteObjItem = options.palette[paletteIndex];
                    if (paletteObjItem != undefined) {
                        menu.append(options.item.replace(/{name}/gi, options.palette[paletteIndex]).replace(/{color}/gi, paletteObjItem));
                    }
                    paletteIndex++;
                }
                dropdown.append(menu);
            }
            $(this).append(dropdown);
            // item click bindings
            $(this).find('div[name^=picker_]').on('click',
                function () {
                    const selectedColor = $(this).attr('data-color');
                    if (typeof options.onSelected === 'function') {
                        options.onSelected(selectedColor);
                    }
                });
        }
    }

    $.fn.colorPalettePicker = function (options) {
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Option ' + options + ' not found in colorPalettePicker');
        }
    };

    $.fn.colorPalettePicker.defaults = {
        button: '<button name="colorpalettebutton" class="{buttonClass}" data-toggle="dropdown" style="height:32px;line-height:18px;color:#363a40;background-color:#fdfdfd;border-color:#d7d7d7;font-family:Roboto;font-weight:400;font-size:14px;">{buttonText}</button>',
        buttonClass: 'btn btn-secondary dropdown-toggle btn-outline colorpallete-button',
        buttonText: 'Select Color',
        dropdown: '<div class="dropdown-menu">',
        dropdownTitle: '',
        menu: '<ul class="list-inline" style="padding-left:10px;padding-right:10px;margin-bottom:0px !important;">',
        item: '<li class="list-inline-item"><div name="picker_{name}" style="background-color:{color};width:16px;height:16px;border:1px solid #eee;margin:0px;cursor:pointer" title="{name}" data-color="{color}"></div></li>',
        palette: ['#363A40', '#993300', '#333300', '#003300', '#2C4C96', '#000080', '#333399', '#CC0000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#26E5C2', '#00CCFF', '#993366', '#FF99CC', '#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#000000', '#2D2D2D', '#545454', '#808080', '#99CC00', '#D4D4D4', '#FFFFFF'],
        lines: 1,
        bootstrap: 4,
        onSelected: null
    };
})(jQuery);