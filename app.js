{
  const svg = d3.select('#path-group');
  const answerOneBtn = d3.select('.answer-one');
  const answerTwoBtn = d3.select('.answer-two');
  const prevBtn = d3.select('.previous');
  const nextBtn = d3.select('.next');

  const MAGENTA = '#FA2F97';
  const BLACK = '#000';
  const WHITE = '#FFF';
  const GREY = '#C9C9C9';

  let currentNode = d3.select('#chart-dot-two');
  let selectedPath = null;
  let notSelectedPath = null;
  let isAnimating = false;

  init();

  function init() {
    addAnswerListeners();
    addNavListeners();
  }

  function reset() {
    if (selectedPath === null) return;

    const drawnPath = d3.select('#' + selectedPath.attr('id') + '-draw-line');
    const endNode = d3.select('#' + selectedPath.attr('data-end-node'));

    drawnPath.remove();
    unfillDot(endNode);
    selectedPath = null;
    notSelectedPath = null;
  }

  function addAnswerListeners() {
    const answerBtns = [answerOneBtn, answerTwoBtn];

    answerBtns.forEach((button) => {
      if (button.attr('data-path') === null) {
        removeClickHandlers(button);
        return;
      }

      const pathName = '#' + button.attr('data-path');
      const path = d3.select(pathName)
      const endNode = d3.select('#' + path.attr('data-end-node'));


      button
        .on('click', () =>  onClick(path))
        .on('mouseenter', () => mouseEnterAnswer(path, endNode))
        .on('mouseout', () => mouseOutAnswer(path, endNode));
    });

    function onClick(path) {
      const currentNodeId = currentNode.attr('id');
      const possiblePaths = roadMap[currentNodeId].paths

      reset();

      selectedPath = path;

      notSelectedPathId =
        _.find(possiblePaths, (p) => p.name !== selectedPath.attr('id')).id;

      notSelectedPath = d3.select(notSelectedPathId);

      animateAnswerPath(path)
    }

    function mouseEnterAnswer(path, endNode) {
      if (isAnimating) return;

      path.classed('highlight-line', true);
      fillInDot({targetNode: endNode});
    }

    function mouseOutAnswer(path, endNode) {
      const isNodeFull = endNode.attr('data-filled') === 'true' ? true : false;

      if (!isNodeFull) {
        path.classed('highlight-line', false);
        unfillDot(endNode)
      }
    }
  }

  // TODO: Implement prev
  function addNavListeners() {

    nextBtn.on('click', onClick);

    function onClick() {
      if (selectedPath !== null) {
        const animatedPath = selectedPath;
        console.log('NOT SELECTED PATH: ')
        console.log(notSelectedPath.node());

        invalidatePath(notSelectedPath);
        changeToPastNode(currentNode);

        currentNode = d3.select(`#${selectedPath.attr('data-end-node')}`)

        const nextPathOne = d3.select(`#${currentNode.attr('data-path-one')}`);
        const nextPathTwo = d3.select(`#${currentNode.attr('data-path-two')}`);

        answerOneBtn.attr('data-path', currentNode.attr('data-path-one'));
        answerTwoBtn.attr('data-path', currentNode.attr('data-path-two'));

        addAnswerListeners();

        reset();


        animateAnswerPath(animatedPath, true);

        if (nextPathOne.node() !== null)
          animateBlackPath(nextPathOne, 1010);

        if (nextPathTwo.node() !== null)
          animateBlackPath(nextPathTwo, 1010);
      }
    }
  }

  function animateAnswerPath(path, expandNode = false) {
    const pathId = path.attr('id');
    const duration = 1000;
    const d = path.attr('d');
    const endNode = d3.select('#' + path.attr('data-end-node'));
    const totalLength = path.node().getTotalLength();

    isAnimating = true;

    if (!expandNode)
      unfillDot(endNode)

    // Reset path from hover event
    path
      .classed('dashed-line', true);

    svg.insert('path', `#${pathId} + *`)
        .attr('id', `${pathId}-draw-line`)
        .attr('d', d)
        .attr('stroke', MAGENTA)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);

    if (expandNode) {
      expandEllipsis(endNode, duration + 10)
    } else {
      const payload = {
        targetNode: endNode,
        delay: duration + 10,
        transition: true,
        filled: true
      };

      fillInDot(payload);
    }
  }

  function animateBlackPath(path, delay = 0) {
    const clonedPath = clonePathAndInsert(path);
    const totalLength = path.node().getTotalLength();
    const dashArray = createDashArray('3, 3', totalLength);
    const endNode = d3.select(`#${path.attr('data-end-node')}`);

    path
      .attr('stroke', BLACK)
      .attr('stroke-width', 2)
      .attr('stroke-dashoffset', totalLength)
      .attr('stroke-dasharray', dashArray)
      .transition()
        .duration(1000)
        .delay(delay)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
      .on('end', () => {
        clonedPath.remove();
        createBlackNode(endNode);
      });
  }

  function invalidatePath(path) {
    const endNode = d3.select('#' + path.attr('data-end-node'));

    endNode
      .style('stroke', GREY);

    path
      .style('stroke', GREY)
      .style('stroke-dasharray', 0)
      .style('stroke-width', 1);
  }

  function fillInDot({targetNode = {}, delay = 0, transition = false, filled = false} = {}) {
    if (transition) {
      targetNode
        .transition()
        .delay(delay)
        .style('fill', MAGENTA)
        .attr('data-filled', filled)
        .on('end', () => isAnimating = false)
    } else {
      targetNode
        .style('fill', MAGENTA)
    }
  }

  function unfillDot(targetNode) {
    targetNode
      .style('fill', WHITE)
      .attr('data-filled', false)
      .on('end', () => isAnimating = false)
  }

  function createBlackNode(targetNode) {
    targetNode
      .transition()
        .duration(300)
        .ease(d3.easeLinear)
        .attr('stroke', BLACK);
  }

  function changeToPastNode(targetNode) {
    targetNode
      .attr('stroke', MAGENTA)
      .style('fill', MAGENTA)
      .select('ellipse')
        .attr('rx', 6.6305)
        .attr('ry', 6.6279);

    targetNode
      .select('use')
      .style('display', 'none');

  }

  function expandEllipsis(targetNode, delay = 0) {
    // TODO: Chain exit functions instead of using setTimeout
    setTimeout(function() {
      targetNode
        .transition()
          .duration(200)
          .ease(d3.easeLinear)
          .style('fill', MAGENTA)
          .style('stroke', MAGENTA)
          .attr('stroke-width', 0)

      targetNode
        .select('ellipse')
        .transition()
          .duration(300)
          // .ease(d3.easeLinear)
          .attr('rx', 11.05096)
          .attr('ry', 11.04656)
          .attr('cx', 11.05096)
          .attr('cy', 11.04656)
        // .transition()
        //   .duration(300)
        //   .delay(300)
        //   .attr('rx', 6.77)
        //   .attr('ry', 6.67)

      targetNode
        .append('use')
        .style('stroke-width', 4)
        .attr('mask', 'url(#mask-2)')
        .attr('xlink:href', '#path-1')
        .attr('stroke', MAGENTA)
        .transition()
          .duration(200)
          .delay(200)
          // .ease(d3.easeBounceInOut)
          .attr('stroke', WHITE)
        .on('end', () => isAnimating = false)
    }, delay)
  }


  function clonePathAndInsert(path) {
    const d = path.attr('d');
    const stroke = path.attr('stroke');
    const strokeWidth = path.attr('stroke-width');
    const clonedPath = svg.insert('path', `#${path.attr('id')}`)
                          .attr('id', `${path.attr('id')}-draw-line-grey`)
                          .attr('d', d)
                          .attr('stroke', stroke)
                          .attr('stroke-width', strokeWidth);

    return clonedPath;
  }

  function createDashArray(dashing, length) {
    const dashLength = dashing
                        .split(/[\s,]/)
                        .map((a) => parseFloat(a) || 0 )
                        .reduce((a, b) => a + b);

    const dashCount = Math.ceil(length / dashLength);
    const newDashes = new Array(dashCount).join(dashing + ' ');
    const dashArray = `${newDashes} 0, ${length}`;

    return dashArray;
  }

  function removeClickHandlers(button) {
    button
      .on('click', null)
      .on('mouseenter', null)
      .on('mouseout', null);
  }

  var roadMap = {
    'chart-dot-one': {
      'id': '#chart-dot-one',
      'paths': [
        {
          'name': 'path-six',
          'id': '#path-six',
          'endNode': 'chart-dot-four'
        }
      ]
    },
    'chart-dot-two': {
      'id': '#chart-dot-two',
      'paths': [
        {
          'name': 'path-one',
          'id': '#path-one',
          'endNode': 'chart-dot-eight'
        },
        {
          'name': 'path-two',
          'id': '#path-two',
          'endNode': 'chart-dot-nine'
        }
      ]
    },
    'chart-dot-three': {
      'id': '#chart-dot-three',
      'paths': [
        {
          'name': 'path-three',
          'id': '#path-three',
          'endNode': 'chart-dot-five'
        },
        {
          'name': 'path-four',
          'id': '#path-four',
          'endNode': 'chart-dot-four'
        }
      ]
    },
    'chart-dot-seven': {
      'id': '#chart-dot-eight',
      'paths': null
    },
    'chart-dot-eight': {
      'id': '#chart-dot-eight',
      'paths': [
        {
          'name': 'path-five',
          'id': '#path-five',
          'endNode': 'chart-dot-one'
        },
        {
          'name': 'path-seven',
          'id': '#path-seven',
          'endNode': 'chart-dot-six'
        }
      ]
    },
    'chart-dot-nine': {
      'id': '#chart-dot-nine',
      'paths': [
        {
          'name': 'path-eight',
          'id': '#path-eight',
          'endNode': 'chart-dot-seven'
        },
        {
          'name': 'path-nine',
          'id': 'path-nine',
          'endNode': 'chart-dot-nine'
        }
      ]
    }
  }
}
