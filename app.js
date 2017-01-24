const svg = d3.select('#path-group');

let isAnimating = false;

init();

function init() {
  const answerOne = d3.select('.answer-one');
  const answerTwo = d3.select('.answer-two');

  addListeners(answerOne);
  addListeners(answerTwo)
}


function addListeners(button) {
  const pathName = '#' + button.attr('data-path');
  const path = d3.select(pathName)
  const endNode = path.attr('data-end-node');

  button.on('click', () =>  animatePath(path));

  button
    .on('mouseenter', () => {
      if (!isAnimating) {
        path.classed('highlight-line', true);

        fillInDot(endNode, 0);
      }
    })
    .on('mouseleave', () => {
      path.classed('highlight-line', false);

      unfillDot(endNode)
    });

}

function animatePath(path) {
  const duration = 1000;
  const d = path.attr('d');
  const endNode = path.attr('data-end-node');
  const totalLength = path.node().getTotalLength();

  isAnimating = true;

  // Reset path from hover event
  path
    .classed('dashed-line', true);

  // TODO: Can this be done as a css class toggle instead?
  unfillDot(endNode)

  // debugger;

  svg.insert('path', `#${path.attr('id')} + *`)
      .attr('d', d)
      .attr('stroke', '#FA2F97')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

  fillInDot(endNode, duration + 10);
}

// This animates with dotted line, allow more abstract class targeting
function animateSevenPath() {
  const path = svg.select('#path-group-seven');
  const d = path.attr('d');
  const endNode = path.attr('data-end-node');

  const pathWhite = svg.insert('path', 'path#path-group-eight')
    .attr('id', 'path-group-insert-white')
    .attr('d', d)
    .attr('stroke', '#FFFFFF')
    .attr('stroke-width', 2)

  const pathDotted = svg.insert('path', 'path#path-group-eight')
    .attr('id', 'path-group-insert-two')
    .attr('d', d)
    .attr('stroke', '#FA2F97')
    .attr('stroke-width', 2)

  const totalLength = path.node().getTotalLength();

  const dashing = '3, 3';
  const dashLength = dashing
                    .split(/[\s,]/)
                    .map((a) => parseFloat(a) || 0 )
                    .reduce((a, b) => a + b );

  const dashCount = Math.ceil( totalLength / dashLength );
  const newDashes = new Array(dashCount).join( dashing + " " );
  const dashArray = newDashes + " 0, " + totalLength;

  d3.select('path#path-group-insert-two')
    .attr('stroke-dashoffset', totalLength)
    .attr('stroke-dasharray', dashArray)
    .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

  d3.select('#path-group-insert-white')
    .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
      .duration(1200)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

  fillInDot(endNode);
}

function expandEllipsis(targetNode, delay = 1025) {
  setTimeout(function() {
    svg.select(`#${targetNode}`)
    .transition()
      .duration(200)
      // .ease(d3.easeLinear)
      .attr('fill', '#FA2F97')
      .attr('stroke', '#FA2F97')
      .attr('stroke-width', 0)

    svg.select(`#${targetNode} ellipse`)
      .transition()
        .duration(300)
        // .ease(d3.easeLinear)
        .attr('rx', 11.05)
        .attr('ry', 11.05)
      .transition()
        .duration(300)
        .delay(300)
        .attr('rx', 6.77)
        .attr('ry', 6.67)

    svg.select(`#${targetNode}`)
      .append('use')
      .attr('stroke-width', 4)
      .attr('mask', 'url(#mask-2)')
      .attr('xlink:href', '#path-1')
      .attr('stroke', '#FA2F97')
      .transition()
        .duration(200)
        .delay(200)
        // .ease(d3.easeBounceInOut)
        .attr('stroke', '#FFFFFF')
      .transition()
        // .duration(400)
        .delay(205)
        // .ease(d3.easeLinear)
        .remove()
  }, delay)
}

// TODO: Make it so transition is based on parameter
function fillInDot(targetNode, delay = 0) {
  d3.select(`#${targetNode}`)
    .transition()
    .delay(delay)
    .attr('fill', '#FA2F97')
    .on('end', function() {
      isAnimating = false;
    });
}

function unfillDot(targetNode, delay = 0) {
  d3.select(`#${targetNode}`)
    .attr('fill', '#FFFFFF')
    .on('end', function() {
      isAnimating = false;
    });
}