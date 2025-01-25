import mitt from "mitt";

type Events = {
  to: string
  gallery: string
  tool: string
  pathname: string
  extract: string
}

const emitter = mitt<Events>();
export default emitter;
