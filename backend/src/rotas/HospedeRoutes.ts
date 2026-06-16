import { Router } from 'express';
import { ControllerHospede } from '../adaptadores/ControllerHospede';

const hospedeRoutes = Router();
const controllerHospede = new ControllerHospede();

hospedeRoutes.post('/hospedes', (req, res) => controllerHospede.salvar(req, res));
hospedeRoutes.get('/hospedes', (req, res) => controllerHospede.listar(req, res));
hospedeRoutes.get('/hospedes/:cpf', (req, res) => controllerHospede.consultar(req, res));
hospedeRoutes.put('/hospedes/:cpf', (req, res) => controllerHospede.alterar(req, res));
hospedeRoutes.delete('/hospedes/:cpf', (req, res) => controllerHospede.inativar(req, res));
hospedeRoutes.post('/hospedes/:cpf/reativar', (req, res) => controllerHospede.reativar(req, res));


export { hospedeRoutes };
