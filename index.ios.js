/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Animated,
  AppRegistry,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  View,
  StatusBar,
  ScrollView
} from 'react-native';

let windowSize = Dimensions.get('window');

const {
  PropTypes
} = React;

const GL = require("gl-react");
const { Surface } = require("gl-react-native");

const shaders = GL.Shaders.create({
  blur1D: {
// blur9: from https://github.com/Jam3/glsl-fast-gaussian-blur
    frag: `precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main () {
  gl_FragColor = blur9(t, uv, resolution, direction);
}`
  }
});

module.exports = GL.createComponent(
  ({ width, height, pixelRatio, direction, children: t }) =>
    <GL.Node
      shader={shaders.blur1D}
      width={width}
      height={height}
      pixelRatio={pixelRatio}
      uniforms={{
      direction,
      resolution: [ width, height ],
      t
    }}
    />,
  {
    displayName: "Blur1D",
    propTypes: {
      direction: PropTypes.array.isRequired,
      children: PropTypes.any.isRequired
    }
  });

const Blur1D = GL.createComponent(
  ({ width, height, direction, children }) =>
    <GL.Node
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        resolution: [ width, height ]
      }}>
      <GL.Uniform name="t">{children}</GL.Uniform>
    </GL.Node>
  , {
    displayName: "Blur1D"
  });

const Blur = GL.createComponent(({ width, height, factor, children }) =>
    <Blur1D width={width} height={height} direction={[ factor, 0 ]}>
      <Blur1D width={width} height={height} direction={[ 0, factor ]}>
        <Blur1D width={width} height={height} direction={[ -factor/Math.sqrt(4), factor/Math.sqrt(4) ]}>
          <Blur1D width={width} height={height} direction={[ factor/Math.sqrt(4), factor/Math.sqrt(4) ]}>
            <Blur1D width={width} height={height} direction={[ -factor/Math.sqrt(8), factor/Math.sqrt(8) ]}>
              <Blur1D width={width} height={height} direction={[ factor/Math.sqrt(8), factor/Math.sqrt(8) ]}>
                {children}
              </Blur1D>
            </Blur1D>
          </Blur1D>
        </Blur1D>
      </Blur1D>
    </Blur1D>
  , {
    displayName: "Blur"
  });

class reactblur extends Component {

  constructor(props) {
    super(props);

    this.state = {
      animValue: 0
    }
  }

  Blur(e) {
    let yOffset = e.nativeEvent.contentOffset.y * 0.025;
    
    this.setState({animValue: yOffset});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{position: 'absolute', top: 0, left: 0}}>

          <Surface width={windowSize.width} height={300}>
            <Blur factor={this.state.animValue}>
              https://upload.wikimedia.org/wikipedia/commons/f/f3/Skyline_of_Toronto_viewed_from_Harbour_modified.png
            </Blur>
          </Surface>

        </View>
        <ScrollView scrollEventThrottle={16} onScroll={(e) => this.Blur(e)}>
          <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
          </ScrollView>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('reactblur', () => reactblur);
