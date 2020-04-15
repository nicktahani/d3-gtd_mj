function gtdVis () {

  const width = 960 * 0.7;
  const height = 500;

  const svg = d3.select('#gtdVis')
   .attr('width', width)
   .attr('height', height)
   .append('g')
   .attr('transform', 'scale(0.7)')

  let terrorismData = null

  //const svg = d3.select('svg')

  const slider = document.getElementById('mySlider')
  
  slider.addEventListener('input', handleSliderChange)

  function handleSliderChange(event) {
    const year = event.target.value
    const filteredData = terrorismData.filter(d => {
      if (d.iyear == year) {
        return true
      } else {
        return false
      }
    })      
    chartData(filteredData)
  }

  // const handleSliderChange = e => {
  //   const year = e.target.value
  //   const filteredData = terrorismData.filter(d => {
  //     d.iyear == year ? true : false  
  //   })      
  //   chartData(filteredData)
  // }

  const output = document.getElementById('val');
    output.innerHTML = slider.value

  slider.oninput = function() {
    output.innerHTML = this.value
  }

  const proj = d3.geoAlbers()
  const path = d3.geoPath(proj)

  Promise.all([
    d3.json('data/us.json'),
    d3.csv('globalterrorismAA_US.csv')
  ])
    .then(go)
    .catch(e => console.error(e))

  function go ([us, data]) {
    terrorismData = data
    

    //console.log(terrorismData)

    svg.append("path")
      .attr("d", path(topojson.feature(us, us.objects.states)))

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
      .domain([0, d3.max(points, d => d.properties.nkill)])
      .range([5, 15])

    svg.selectAll('circle').remove()

    svg.selectAll('circle')
      .data(points)
    .enter().append('circle')
      .attr('cx', d => path.centroid(d)[0])
      .attr('cy', d => path.centroid(d)[1])
      .attr('r', d => radius(d.properties.nkill))
      .style('fill', 'red')
      .style('opacity', 0.5)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
  }

  const tooltip = d3.select('#tooltip1')
    .attr('class', 'tooltip')
    // .style("display", "none");

  function mouseover(d) {
    tooltip.style('display', 'inline');
    tooltip
      .html('Fatalities: '  + d.properties.nkill + '<br>Location: ' + d.properties.city + ', ' + d.properties.provstate + '<br>Description: ' + d.properties.summary)

  }

  function mouseout() {
    tooltip.style('display', 'none');
  }
}

gtdVis()
