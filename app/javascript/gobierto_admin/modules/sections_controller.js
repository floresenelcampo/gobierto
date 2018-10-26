import 'jqtree'
import 'webpack-jquery-ui/draggable'
import 'webpack-jquery-ui/droppable'

window.GobiertoAdmin.SectionsController = (function() {
  function SectionsController() {}

  SectionsController.prototype.show = function() {
    _tree();
  };

  function _endpoint(nodeId = undefined) {
    var endpoint = window.location.pathname + '/section_items';
    if (nodeId) { endpoint += ('/' + nodeId); }
    return endpoint;
  }

  function _tree() {
    $(function() {
      var $tree = $('#tree1');
      $.getJSON(
        _endpoint(),
        function(data) {
          $('#tree1').tree({
            data: data['section_items'],
            autoOpen: true,
            dragAndDrop: true,
            onDragStop: handle_drag_stop,
            onCreateLi: function(node, $li) {
              // Append a link to the jqtree-element div.
              // The link has an url '#node-[id]' and a data property 'node-id'.

              if (node.visibility_level !== "active") {
                var newName = $li.find("span").text() + " ("+ I18n.t("gobierto_admin.shared.draft") +")"
                $li.find("span").text(newName);
                $li.find(".jqtree-title").addClass("draft");
              }

              $li.find('.jqtree-element').append(
                '<a remote=true href="#node-' + node.id + '" class="delete"><i class="fa fa-trash-o tipsit" data-node-id="' +
                node.id + '" title="' + I18n.t('gobierto_admin.gobierto_cms.sections.show.delete_element') + '"></i></a>'
              );
            }
          });
        }
      );

      function handle_drag_stop(node) {
        $.ajax({
          url: _endpoint(node.id),
          type: 'PUT',
          dataType: 'json',
          data: {
            tree: $('#tree1').tree('toJson')
          },
          success: function() {},
          error: function() {}
        });
      }

      // Handle a click on the edit link
      $tree.on(
        'click', '.delete',
        function(e) {
          // Get the id from the 'node-id' data property
          var node_id = $(e.target).data('node-id');

          // Get the node from the tree
          var node = $tree.tree('getNodeById', node_id);

          if (node) {
            // Display the node name
            $tree.tree('removeNode', node);
          }

          $.ajax({
            type: "POST",
            url: _endpoint(node_id),
            dataType: "json",
            data: {
              "_method": "delete"
            },
            complete: function() {

            }
          });

          return false;
        }
      );
    });

    // Define the elements that can be dragged
    $(".draggable").draggable({
      revert: true
    });

    $("#tree1").droppable({
      drop: function(event, ui) {
        $.ajax({
          url: _endpoint(),
          type: 'POST',
          dataType: 'json',
          data: {
            page_id: ui.draggable.attr("data-id")
          },
          success: function(data) {
            $('#tree1').tree(
              'appendNode', {
                name: ui.draggable.attr("data-title"),
                id: data.id
              }
            );
          },
          error: function() {}
        });
      }
    });

    $('#collapse').click(function() {
      var $tree = $('#tree1');
      var tree = $tree.tree('getTree');
      tree.iterate(function(node) {

        if (node.hasChildren()) {
          $tree.tree('closeNode', node, true);
        }
        return false;
      });
    });

    $('#expand').click(function() {
      var $tree = $('#tree1');
      var tree = $tree.tree('getTree');
      tree.iterate(function(node) {

        if (node.hasChildren()) {
          $tree.tree('openNode', node, true);
        }
        return false;
      });
    });
  }

  return SectionsController;
})();

window.GobiertoAdmin.sections_controller = new GobiertoAdmin.SectionsController;
