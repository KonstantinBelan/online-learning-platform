import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement } from './redux/features/counterSlice' // Или './store/features/counterSlice'

function App() {
	const count = useSelector(state => state.counter.value)
	const dispatch = useDispatch()

	return (
		<div>
			<h1>Count: {count}</h1>
			<button onClick={() => dispatch(increment())}>Increment</button>
			<button onClick={() => dispatch(decrement())}>Decrement</button>
		</div>
	)
}

export default App
