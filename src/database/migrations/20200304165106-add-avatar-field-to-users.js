module.exports = {
    up: (queryInterface, Sequelize) => {
        // Add campo 'avatar_id' dentro da tabela 'users.
        // Cria referência que 'avatar_id' terá o mesmo conteúdo da coluna 'id' da tabela 'files
        // 'onUpdate' e 'onDelete' são ações na coluna 'avatar_id' caso o registro na tabela 'files' sofra alteração ou remoção do BD
        return queryInterface.addColumn('users', 'avatar_id', {
            type: Sequelize.INTEGER,
            references: { model: 'files', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: true,
        });
    },

    down: queryInterface => {
        return queryInterface.removeColumn('users', 'avatar_id');
    },
};
