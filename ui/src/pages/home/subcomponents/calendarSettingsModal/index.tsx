import { useState, useEffect } from "react";
import { Modal, Stack, Group, Text, Box, Checkbox, Loader, Badge, UnstyledButton, alpha } from "@mantine/core";
import { TbCalendar, TbChevronDown, TbChevronUp, TbInfoCircle, TbBrandGoogle, TbLock } from "react-icons/tb";

import Button from "@components/button";
import useToastStore from "@stores/toast";
import useAction from "@hooks/useAction";
import useCalendarStore from "@stores/calendar";

import type { GoogleCalendarItem } from "@actions/google/calendar/types";
import type { CalendarSettingsModalProps } from "./types";
import { colors, tokens } from "@styles/theme";

export const CalendarSettingsModal = ({ isOpen, onClose, onSaved }: CalendarSettingsModalProps) => {
  const { showToast } = useToastStore();
  const runAction = useAction();
  const {
    calendars,
    selectedCalendarIds,
    isConnected,
    isLoading,
    isSaving,
    isConnecting,
    fetchCalendars,
    toggleCalendar,
    saveSelectedCalendars,
    connectGoogle
  } = useCalendarStore();

  const [isMyCalendarsOpen, setIsMyCalendarsOpen] = useState(true);
  const [isOtherCalendarsOpen, setIsOtherCalendarsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    fetchCalendars().catch(() => {
      showToast("Não foi possível carregar as agendas do Google.", "error");
    });
  }, [isOpen, fetchCalendars, showToast]);

  const handleConnectGoogle = async () => {
    try {
      await connectGoogle();
    } catch {
      showToast("Falha ao obter URL de autenticação do Google.", "error");
    }
  };

  const handleSave = () =>
    runAction({
      action: saveSelectedCalendars,
      toastMessages: {
        success: "Preferências de agendas salvas com sucesso!",
        error: "Falha ao salvar preferências de agendas."
      },
      callback: () => {
        onSaved?.();
        onClose();
      }
    });

  const myCalendars = calendars.filter(
    (c) => c.isLabV2 || c.primary || c.accessRole === "owner" || c.accessRole === "writer"
  );
  const otherCalendars = calendars.filter(
    (c) => !c.isLabV2 && !c.primary && c.accessRole !== "owner" && c.accessRole !== "writer"
  );

  const renderCalendarRow = (item: GoogleCalendarItem) => {
    const isChecked = selectedCalendarIds.includes(item.id);
    const color = item.backgroundColor || colors.indigo500;

    return (
      <Box
        key={item.id}
        p="xs"
        onClick={() => toggleCalendar(item.id)}
        style={{
          borderRadius: 8,
          backgroundColor: isChecked ? tokens.surfaceHover : "transparent",
          border: "1px solid",
          borderColor: isChecked ? alpha(colors.indigo500, 0.35) : "transparent",
          transition: "all 0.15s ease",
          cursor: "pointer"
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Checkbox
              checked={isChecked}
              onChange={() => {}}
              color="indigo"
              size="sm"
              styles={{
                input: {
                  cursor: "pointer",
                  borderColor: isChecked ? color : tokens.textMuted
                }
              }}
            />

            <Box
              w={10}
              h={10}
              style={{
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0
              }}
            />

            <Text
              size="sm"
              fw={item.isLabV2 ? 600 : 500}
              c={isChecked ? "white" : "dimmed"}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {item.summary}
            </Text>
          </Group>

          <Box style={{ flexShrink: 0 }}>
            {item.isLabV2 ? (
              <Badge
                variant="filled"
                color="teal"
                size="xs"
                styles={{
                  root: {
                    textTransform: "none",
                    fontWeight: 600
                  }
                }}
              >
                Editável e marcável
              </Badge>
            ) : (
              <Badge
                variant="light"
                color="gray"
                size="xs"
                leftSection={<TbLock size={10} />}
                styles={{
                  root: {
                    textTransform: "none",
                    fontWeight: 500,
                    opacity: 0.8
                  }
                }}
              >
                Somente visualização
              </Badge>
            )}
          </Box>
        </Group>
      </Box>
    );
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Box>
          <Group gap="xs" align="center">
            <TbCalendar size={20} color={colors.indigo400} />
            <Text fw={600} size="md" c={tokens.textPrimary}>
              Configurar agendas
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Escolha quais agendas serão exibidas no calendário.
          </Text>
        </Box>
      }
      centered
      radius="lg"
      size="md"
      styles={{
        content: {
          backgroundColor: colors.night800,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadow,
          color: colors.gray200,
          padding: "20px 24px"
        },
        header: {
          backgroundColor: colors.night800,
          borderBottom: `1px solid ${tokens.border}`,
          paddingBottom: 14,
          marginBottom: 16
        }
      }}
    >
      {isLoading ? (
        <Group justify="center" align="center" py="xl">
          <Loader color="indigo" size="sm" />
          <Text size="sm" c="dimmed">
            Carregando agendas...
          </Text>
        </Group>
      ) : (
        <Stack gap="md">
          {/* Caixa de regras/aviso claro */}
          <Box
            p="xs"
            style={{
              borderRadius: 8,
              backgroundColor: alpha(colors.indigo500, 0.08),
              border: `1px solid ${alpha(colors.indigo500, 0.2)}`
            }}
          >
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <TbInfoCircle size={18} color={colors.indigo400} style={{ flexShrink: 0, marginTop: 2 }} />
              <Text size="xs" c={colors.indigo200} lh={1.4}>
                Apenas as metas e eventos do <strong>Lab V2</strong> são editáveis e marcáveis. As demais agendas
                aparecem somente para visualização de compromissos.
              </Text>
            </Group>
          </Box>

          {!isConnected ? (
            <Stack gap="sm" py="sm">
              <Box
                p="md"
                style={{
                  borderRadius: 10,
                  backgroundColor: tokens.surfaceSubtle,
                  border: `1px solid ${tokens.border}`
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Box
                      w={10}
                      h={10}
                      style={{
                        borderRadius: "50%",
                        backgroundColor: colors.teal400
                      }}
                    />
                    <Text size="sm" fw={600} c={tokens.textPrimary}>
                      Lab V2
                    </Text>
                  </Group>
                  <Badge variant="filled" color="teal" size="xs">
                    Editável e marcável
                  </Badge>
                </Group>
              </Box>

              <Box
                p="md"
                style={{
                  borderRadius: 10,
                  backgroundColor: tokens.surfaceSubtle,
                  border: `1px dashed ${tokens.borderStrong}`,
                  textAlign: "center"
                }}
              >
                <Text size="sm" c="dimmed" mb="xs">
                  Conecte sua conta do Google para visualizar suas outras agendas aqui no Lab V2.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<TbBrandGoogle size={16} />}
                  isLoading={isConnecting}
                  onClick={handleConnectGoogle}
                >
                  Conectar Google Agenda
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack gap="sm">
              {/* Seção Minhas agendas */}
              {myCalendars.length > 0 && (
                <Box>
                  <UnstyledButton
                    onClick={() => setIsMyCalendarsOpen((prev) => !prev)}
                    style={{ width: "100%", padding: "4px 0", cursor: "pointer" }}
                  >
                    <Group justify="space-between" align="center">
                      <Text size="xs" fw={600} c={colors.gray400} tt="uppercase" style={{ letterSpacing: "0.5px" }}>
                        Minhas agendas
                      </Text>
                      {isMyCalendarsOpen ? (
                        <TbChevronUp size={16} color={colors.gray400} />
                      ) : (
                        <TbChevronDown size={16} color={colors.gray400} />
                      )}
                    </Group>
                  </UnstyledButton>

                  {isMyCalendarsOpen && (
                    <Stack gap={4} mt={6}>
                      {myCalendars.map(renderCalendarRow)}
                    </Stack>
                  )}
                </Box>
              )}

              {/* Seção Outras agendas */}
              {otherCalendars.length > 0 && (
                <Box mt="xs">
                  <UnstyledButton
                    onClick={() => setIsOtherCalendarsOpen((prev) => !prev)}
                    style={{ width: "100%", padding: "4px 0", cursor: "pointer" }}
                  >
                    <Group justify="space-between" align="center">
                      <Text size="xs" fw={600} c={colors.gray400} tt="uppercase" style={{ letterSpacing: "0.5px" }}>
                        Outras agendas
                      </Text>
                      {isOtherCalendarsOpen ? (
                        <TbChevronUp size={16} color={colors.gray400} />
                      ) : (
                        <TbChevronDown size={16} color={colors.gray400} />
                      )}
                    </Group>
                  </UnstyledButton>

                  {isOtherCalendarsOpen && (
                    <Stack gap={4} mt={6}>
                      {otherCalendars.map(renderCalendarRow)}
                    </Stack>
                  )}
                </Box>
              )}
            </Stack>
          )}

          {/* Botões do Rodapé */}
          <Group justify="flex-end" gap="sm" mt="md" pt="sm" style={{ borderTop: `1px solid ${tokens.border}` }}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            {isConnected && (
              <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>
                Salvar alterações
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default CalendarSettingsModal;
