import Alpine from "alpinejs"

interface UIState {
    turn: number,
    round: number,
    level: number,
    playerName: string,
    playerColor: string

    state: this
}

export default <UIState>{
    turn: 0,
    round: 0,
    level: 0,
    playerName: 'no player',
    playerColor: '#ffffff',

    get state() {
        return <UIState>Alpine.store('ui');
    }
}