import { useNavigate } from "react-router-dom";
import MyButton from "../components/myButton";
import Home from "../pages/home";

export default function useDefaultValues() {
  const navigate = useNavigate();
  return {
    //global values
    code: null,
    current_game: 0,
    current_round: 0,
    title: 'Willkommen!',
    game_name: '',
    top_right: <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} onClick={() => navigate('/login')}>Login</MyButton>,
    body: <Home />,
    error: '',
    //player values
    last_offer: 0,
    is_previous_offer_accepted: undefined,
    is_logged_in: false, //is_host has a specific usecase
    exit_player: false,
    //host values
    is_host: false,
    game_names: [''],
    exit: false,
    player_count: 0,
    total_player_count: 0,
    offer_phase: 'make_offer',
    offer_per_money: [
      {
        amount: 0,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 10,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 20,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 30,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 40,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 50,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 60,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 70,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 80,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 90,
        open: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 100,
        open: 0,
        accepted: 0,
        declined: 0
      }
    ],
    offer_per_money_total: [[
      {
        amount: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 10,
        accepted: 0,
        declined: 0
      },
      {
        amount: 20,
        accepted: 0,
        declined: 0
      },
      {
        amount: 30,
        accepted: 0,
        declined: 0
      },
      {
        amount: 40,
        accepted: 0,
        declined: 0
      },
      {
        amount: 50,
        accepted: 0,
        declined: 0
      },
      {
        amount: 60,
        accepted: 0,
        declined: 0
      },
      {
        amount: 70,
        accepted: 0,
        declined: 0
      },
      {
        amount: 80,
        accepted: 0,
        declined: 0
      },
      {
        amount: 90,
        accepted: 0,
        declined: 0
      },
      {
        amount: 100,
        accepted: 0,
        declined: 0
      }
    ]],
    offer_per_money_total_percent: [[
      {
        amount: 0,
        accepted: 0,
        declined: 0
      },
      {
        amount: 10,
        accepted: 0,
        declined: 0
      },
      {
        amount: 20,
        accepted: 0,
        declined: 0
      },
      {
        amount: 30,
        accepted: 0,
        declined: 0
      },
      {
        amount: 40,
        accepted: 0,
        declined: 0
      },
      {
        amount: 50,
        accepted: 0,
        declined: 0
      },
      {
        amount: 60,
        accepted: 0,
        declined: 0
      },
      {
        amount: 70,
        accepted: 0,
        declined: 0
      },
      {
        amount: 80,
        accepted: 0,
        declined: 0
      },
      {
        amount: 90,
        accepted: 0,
        declined: 0
      },
      {
        amount: 100,
        accepted: 0,
        declined: 0
      },
    ]]
  }
}