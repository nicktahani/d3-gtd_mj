function shootingVis () {

  const width = 960 * 0.7;
    const height = 400;

    const svg = d3.select('#shootingVis')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'scale(0.7)')

  let shootingData = null

//const svg = d3.select('svg')

  const slider = document.getElementById('mySlider')
    slider.addEventListener('input', handleSliderChange)

  function handleSliderChange(e) {
    const ShootingYear = e.target.value
    const filteredData = shootingData.filter(d => d.year === ShootingYear)      
    chartData(filteredData)
  }

  const output = document.getElementById('val');
    output.innerHTML = slider.value

  slider.oninput = function() {
    output.innerHTML = this.value
  }

  const proj = d3.geoAlbers()
  const path = d3.geoPath(proj)

  Promise.all([
    d3.json('data/us.json'),
    d3.csv('shootings.csv')
  ])
    .then(go)
    .catch(e => console.error(e))

  function go ([us, data]) {
    shootingData = data
    

    //console.log(terrorismData)

    svg.append('path')
      .attr('d', path(topojson.feature(us, us.objects.states)))

    chartData(data)
  }

  function chartData (filteredData) {
    const points = filteredData.map(d => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [+d.longitude, +d.latitude]
        },
        properties: d
      }
    })


    const radius = d3.scaleSqrt()
      .domain([0, d3.max(points, d => d.properties.fatalities)])
      .range([5, 15])

    svg.selectAll('circle').remove()

    svg.selectAll('circle')
      .data(points)
    .enter().append('circle')
      .attr('cx', d => path.centroid(d)[0])
      .attr('cy', d => path.centroid(d)[1])
      .attr('r', d => radius(d.properties.fatalities))
      .style('fill', 'red')
      .style('opacity', 0.5)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
  }

  const tooltip = d3.select('#tooltip1')
    .attr('class', 'tooltip')
    // .style('display', 'none');

  function mouseover(d) {
    tooltip
      .style('display', 'inline')
      .html('Fatalities: ' + d.properties.fatalities + '<br>Location: ' + d.properties.location + '<br>Description: ' + d.properties.summary)
        // .style('left', `${x}px`)
        // .style('top', `${y}px`)
        // .style('transform', d3.select(this).style('transform'))
  }


  function mouseout() {
    tooltip.style('display', 'none');
  }
}

shootingVis()
