import sequelize from 'sequelize';
import Tasks from '../models/TasksModel';

class TaskController {
  async index(req, res) {
    try {
      if (req.query.date) {
        const queryDate = new Date(Number(req.query.date));
        const tasks = await Tasks.findAll({
          where: {
            [sequelize.Op.and]: [
              sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '<=', sequelize.fn('date', queryDate)),
              sequelize.where(sequelize.fn('date', sequelize.col('final_date')), '>=', sequelize.fn('date', queryDate)),
              sequelize.where(sequelize.col('user_id'), req.userId),
            ],
          },
        });

        return res.json(tasks);
      }

      const tasks = await Tasks.findAll({ where: { user_id: req.userId } });

      return res.json(tasks);
    } catch (err) {
      return res.status(400).json({
        errors: err.errors.map((error) => error.message),
      });
    }
  }

  async show(req, res) {
    const { id } = req.params;

    if (!id) return;

    try {
      const task = await Tasks.findByPk(id);
      return res.json(task);
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          errors: err.errors.map((error) => error.message),
        });
      }
      return res.status(400).json(err);
    }
  }

  async create(req, res) {
    try {
      const newTask = {
        ...req.body,
        user_id: req.userId,
      };
      const createdTask = await Tasks.create(newTask);
      return res.json(createdTask);
    } catch (err) {
      return res.status(400).json({
        errors: err.errors.map((error) => error.message),
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ errors: ['Missing ID'] });

      const task = await Tasks.findByPk(id);
      if (!task) return res.status(400).json({ errors: ['Task not found'] });

      const newTask = await task.update(req.body);
      return res.json(newTask);
    } catch (err) {
      return res.status(400).json({
        errors: err.errors.map((error) => error.message),
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ errors: ['Missing ID'] });

      const task = await Tasks.findByPk(id);
      if (!task) return res.status(400).json({ errors: ['Task not found'] });

      const { title, start_date } = await task.destroy();

      return res.json({ title, start_date });
    } catch (err) {
      return res.status(400).json({
        errors: err.errors.map((error) => error.message),
      });
    }
  }
}

export default new TaskController();
