var mouseDown = false;
var selectedPanel = null;
var mainGrid = null;
var mainId = null;

$(document).mousedown(function(e) {
  if(e.which == 1)
    mouseDown = true;
}).mouseup(function(e) {
  if(e.which == 1)
    mouseDown = false;
});

$(function() {
  createNewGlyph()
  createDisplay()
});

function createNewGlyph() {
  let rand = randomInt(0, 999999);
  $('#gridArea').prepend(
    $('<div>').addClass('row').attr('id', 'glyph-' + rand).append(
      $('<div>').addClass('col-md-12 col-lg-12 col-sm-12 col-xs-12').append(
        $('<div>').addClass('panel panel-default').append(
          $('<div>').addClass('panel-heading').append(
            $('<strong>').attr('id', 'glyphHeading-' + rand).html('New Glyph')
          ).append(
            //$('<button>').addClass('close').attr('id', 'btnClose-'+rand).html('&times;')
          ).append(
            $('<br>')
          )
        ).append(
          $('<div>').addClass('panel-body').append(
            $('<div>').addClass('col-md-2 col-lg-2 col-sm-2 col-xs-2').append(
              $('<div>').addClass('panel panel-primary grid-container glyph-panel').append(
                $('<div>').addClass('panel-heading').html('Pixels')
              ).append(
                $('<div>').addClass('panel-body').attr('id', 'grid-'+rand)
              )
            )
          ).append(
            $('<div>').addClass('col-md-4 col-lg-4 col-sm-4 col-xs-4').append(
              $('<div>').addClass('panel panel-primary glyph-panel').append(
                $('<div>').addClass('panel-heading').html('Configuration')
              ).append(
                $('<div>').addClass('panel-body').append(
                  $('<div>').addClass('form-group').append(
                    $('<label>').attr('for', 'glyphName-' + rand).html('Glyph Name:')
                  ).append(
                    $('<input>').addClass('form-control').attr('type', 'text').attr('id', 'glyphName-' + rand).attr('maxlength', '140')
                  )
                ).append(
                  $('<div>').addClass('btn-group config-group').append(
                    $('<button>').addClass('btn btn-md btn-secondary btn-update-display').html('Update').attr('id', 'btnUpdateDisplay-' + rand)
                  )
                ).append(
                  $('<div>').addClass('btn-group config-group').append(
                    $('<button>').addClass('btn btn-md btn-danger').html('Clear Pixel Grid').attr('id', 'btnClear-' + rand)
                  ).append(
                    $('<button>').addClass('btn btn-md btn-info').html('Invert Pixel Grid').attr('id', 'btnInvert-' + rand)
                )
              )
            )
          )
        ).append(
          $('<div>').addClass('col-md-6 col-lg-6 col-sm-6 col-xs-6').append(
            $('<div>').addClass('panel panel-primary glyph-panel output-container').append(
              $('<div>').addClass('panel-heading').html('Output')
            ).append(
              $('<div>').addClass('panel-body').append(
                $('<pre>').attr('id', 'output-' + rand)
              )
            )
          )
        )
      )
    )
  )
  )

  mainGrid = $('#grid-' + rand)
  mainId = rand

  for(let i = 0; i < 8; i++) {
    for(let j = 0; j < 5; j++) {
      $('#grid-' + rand).append(
        $('<canvas>').addClass('pixel off pixel-' + (j + i * 5)).attr('id', 'pixel-' + rand + '-' + (j + i * 5)).mousedown(function(e) {
          if(e.which !== 1) return;
          $(this).toggleClass('on off');
          generateOutput(rand);
        }).mouseenter(function() {
          if(!mouseDown) return;
          $(this).toggleClass('on off');
          generateOutput(rand);
        })
      ).append(' ');
    }
    $('#grid-' + rand).append($('<br>'));
  }

  $('#btnInvert-' + rand).click(function() {
    $('[id^=pixel-' + rand + '-]').toggleClass('on off');
    generateOutput(rand);
  });

  $('#btnClear-' + rand).click(function() {
    $('[id^=pixel-' + rand + '-]').removeClass('on').addClass('off');
    generateOutput(rand);
  });

  $('#glyphName-' + rand).keyup(function() {
    generateOutput(rand);

    let name = escapeHtml($('#glyphName-' + rand).val());
    if(name.trim() === '')
      $('#glyphHeading-' + rand).html('New Glyph');
    else
      $('#glyphHeading-' + rand).html(name);
  });

  $('#btnClose-' + rand).click(function() {
    $('#glyph-' + rand).remove();
  });

   $('#grid-' + rand).mousedown(function(e) {
     e.preventDefault();
   });

  $('#btnUpdateDisplay-' + rand).click(function() {
    if (selectedPanel != null) {
      $(selectedPanel).data('name', $('#glyphName-' + rand).val())
      $('.pixel', selectedPanel).removeClass('on').addClass('off')
      for(let y = 0; y < 8; y++) {
        for(let x = 0; x < 5; x++) {
          if($('#pixel-' + rand + '-' + (x+y*5)).is('.on') == true) {
            $('.pixel-' + (x+y*5), selectedPanel).removeClass('off').addClass('on')
          }
        }
      }
      generateDisplayOutput()
    }
  });

  generateOutput(rand);
}

function createDisplay() {
  for (let i = 0; i < 2*16; ++i) {
    addToDisplay();
  }
  generateDisplayOutput()

  $('#display').on('click', '.display-panel', function () {
    $('#display .display-panel').removeClass('selected')
    if (selectedPanel != this) {
      selectedPanel = this
      $(this).addClass('selected')
    } else {
      selectedPanel = null
    }
    onSelectedChange()
  })
}

function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function generateOutput(id) {
  let outputStr = '';
  let binaryOutput = 'byte ';
  let hexOutput = 'uint8_t ';
  let name = escapeHtml($('#glyphName-' + id).val());

  if(name.trim() == '') {
    binaryOutput += 'name[8] = {\n\t';
    hexOutput += 'name[8] = {';
  } else {
    binaryOutput += (name + '[8] = {\n\t');
    hexOutput += (name + '[8] = {');
  }

  for(let y = 0; y < 8; y++) {
    let currentByte = '';
    let currentHex = '';
    for(let x = 0; x < 5; x++) {
      if($('#pixel-'+id+'-'+(x+y*5)).is('.on') == true)
        currentByte += '1';
      else
        currentByte += '0';
    }
    currentHex = parseInt(currentByte, 2).toString(16);

    binaryOutput += '0b' + currentByte + ((y !== 7) ? ',\n\t' : '\n};');
    hexOutput += '0x' + ((currentHex.length == 2) ? currentHex : ('0' + currentHex)) + ((y !== 7) ? ', ' : '};');
  }

  outputStr += '<strong>Binary:</strong>\n' + binaryOutput + '\n\n<strong>Hexadecimal:</strong>\n' + hexOutput;
  $('#output-' + id).html(outputStr);
}

function escapeHtml(text) {
    'use strict';
    return text.replace(/[\"&<>]/g, function (a) {
        return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
    });
}

function onSelectedChange() {
  if (selectedPanel != null) {
    $('.btn-update-display').removeClass('btn-secondary').addClass('btn-primary')
    $('.pixel', mainGrid).removeClass('on').addClass('off')
      for(let y = 0; y < 8; y++) {
        for(let x = 0; x < 5; x++) {
          if($('.pixel-' + (x+y*5), selectedPanel).is('.on') == true) {
            $('.pixel-' + (x+y*5), mainGrid).removeClass('off').addClass('on')
          }
        }
      }
      $('#glyphName-' + mainId).val($(selectedPanel).data('name') || '')
  } else {
    $('.btn-update-display').addClass('btn-secondary').removeClass('btn-primary')
  }
  generateOutput(mainId)
}

function addToDisplay() {
  const container = $('<div>').addClass('display-panel').append(
    $('<div>').addClass('navigation').append([
      $('<button>').addClass('btn btn-sm btn-primary action-prev').html('<'),
      $('<button>').addClass('btn btn-sm btn-primary action-remove').html('x'),
      $('<button>').addClass('btn btn-sm btn-primary action-next').html('>')
    ])
  )
  const grid = mainGrid.clone().removeAttr('id')
  $('.pixel', grid).removeAttr('id')
  grid.appendTo(container)
  container.appendTo('#display')
}

function generateDisplayOutput() {
  let binary = '';
  let hex = '';
  $('#display .display-panel').each(function (panel_idx) {
    const panel = $(this);
    const name = panel.data('name') || 'char_' + panel_idx;
    binary += 'byte ' + name + '[8] = {\n'
    currentByte = ''
    currentHex = ''
    $('.pixel', panel).each(function (pixel_idx) {
      if (pixel_idx % 5 == 0) {
        if (pixel_idx != 0) {
          binary += '\n'
          currentHex += '0x' + parseInt(currentByte, 2).toString(16) + ', '
        }
        binary += '\t0b'
        currentByte = ''
      }
      binary += $(this).is('.on') == true ? '1' : '0'
      currentByte += $(this).is('.on') == true ? '1' : '0'
    })
    currentHex += '0x' + parseInt(currentByte, 2).toString(16)
    binary += '\n};\n'
    hex += 'uint8_t ' + name + '[8] = {' + currentHex + '}\n';
  })
  $('#display-output').html('<pre>' + binary + '\n' + hex + '</pre>')
}