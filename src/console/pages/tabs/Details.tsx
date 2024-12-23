import { FC, useCallback, useState } from 'react';

import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Card,
  CardHeader,
  CardBody,
  Title,
  Button,
  Modal,
  ModalVariant,
  Flex,
  FlexItem,
  Label,
  Icon
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon, PenIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_ISSUER,
  DEFAULT_SERVICE_ACCOUNT,
  EMPTY_LINK_ACCESS,
  EMPTY_VALUE_SYMBOL,
  I18nNamespace
} from '@config/config';
import FormatOCPDateCell from '@core/components/FormatOCPDate';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import SkTable from '@core/components/SkTable';
import { CrdStatusCondition, StatusSiteType } from '@interfaces/CRD_Base';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import { useWatchedSkupperResource } from 'console/hooks/useSkupperWatchResource';

import DeleteSiteButton from '../components/DeleteSiteButton';
import SiteForm from '../components/forms/SiteForm';

const Details: FC<{ onGoTo: (page: number) => void }> = function ({ onGoTo }) {
  const { t } = useTranslation(I18nNamespace);
  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleModalPros, setVisibleModalProps] = useState<Record<string, boolean>>({});

  const handleOpenModal = (props: Record<string, boolean>) => {
    setIsModalOpen(true);
    setVisibleModalProps(props);
  };

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const ConditionsColumns: SKColumn<CrdStatusCondition<StatusSiteType>>[] = [
    {
      name: t('Type'),
      prop: 'type',
      width: 20
    },
    {
      name: t('Status'),
      prop: 'status',
      width: 20,
      customCellName: 'StatusCell'
    },

    {
      name: t('Reason'),
      prop: 'reason',
      customCellName: 'ReasonCell'
    },
    {
      name: t('Message'),
      prop: 'message',
      customCellName: 'ValueOrEmptyCell'
    },
    {
      name: t('Updated'),
      prop: 'lastTransitionTime',
      customCellName: 'FormatOCPDateCell',
      modifier: 'fitContent'
    }
  ];

  const customSiteCells = {
    FormatOCPDateCell,
    ValueOrEmptyCell: ({ value, data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) =>
      data.reason === 'Error' ? value : EMPTY_VALUE_SYMBOL,
    ReasonCell: ({ data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) =>
      data.reason === 'Error' || data.reason === 'Pending' ? data.reason : EMPTY_VALUE_SYMBOL,
    StatusCell: ({ data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) => {
      if (data.reason === 'Error') {
        return (
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        );
      }

      if (data.reason === 'Pending') {
        return EMPTY_VALUE_SYMBOL;
      }

      return (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
    }
  };

  const site = sites?.[0];

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <Flex style={{ width: '100%' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Flex>
                <FlexItem>
                  <Title headingLevel="h1">{t('Site settings')}</Title>
                </FlexItem>
                {!site?.status && (
                  <Label>
                    <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
                  </Label>
                )}
                {!!site?.status && (
                  <Label>
                    {!!site?.hasError && (
                      <Icon isInline status="danger">
                        <ExclamationCircleIcon />
                      </Icon>
                    )}
                    {!site?.hasError && !!site?.isConfigured && !!site?.isReady && (
                      <Icon status="success">
                        <CheckCircleIcon />
                      </Icon>
                    )}
                    {'  '} {site?.status} {'  '}
                    {!site?.hasError && site?.hasSecondaryErrors && (
                      <Icon status="warning">{<YellowExclamationTriangleIcon />}</Icon>
                    )}
                  </Label>
                )}
              </Flex>
            </FlexItem>
            {site?.name && (
              <FlexItem>
                <DeleteSiteButton id={site.name} />
              </FlexItem>
            )}
          </Flex>
        </CardHeader>

        <CardBody>
          <DescriptionList
            columnModifier={{
              default: '2Col'
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>{site?.name}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('Link access')} <TooltipInfoButton content={t('tooltipSiteLinkAccess')} />
              </DescriptionListTerm>
              <DescriptionListDescription>
                {site?.linkAccess || EMPTY_LINK_ACCESS}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ linkAccess: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Service account')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.serviceAccount}` || DEFAULT_SERVICE_ACCOUNT}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ serviceAccount: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Default issuer')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.defaultIssuer}` || DEFAULT_ISSUER}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ defaultIssuer: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('tooltipHighAvailability')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.ha}`}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ ha: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Status')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Sites in the network')}</DescriptionListTerm>
              {t('sitesInNetwork', { count: site?.sitesInNetwork })}
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Linked sites')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Button variant="link" isInline onClick={() => onGoTo(3)} isDisabled={!site?.linkCount}>
                  {t('remoteSiteWithCount', { count: site?.linkCount })}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Details')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Platform')}</DescriptionListTerm>
              <DescriptionListDescription>{`${site?.platform}` || EMPTY_VALUE_SYMBOL}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
              <DescriptionListDescription>
                {site?.isConfigured ? (
                  <FormatOCPDateCell value={new Date(site.creationTimestamp)} />
                ) : (
                  EMPTY_VALUE_SYMBOL
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      {site?.conditions && (
        <Card isPlain>
          <CardHeader>
            <Title headingLevel="h1">{t('Conditions')}</Title>
          </CardHeader>

          <CardBody>
            <SkTable
              columns={ConditionsColumns}
              rows={site?.conditions}
              alwaysShowPagination={false}
              isPlain
              customCells={customSiteCells}
              variant="compact"
            />
          </CardBody>
        </Card>
      )}
      <Modal
        title={t('Edit site')}
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        aria-label="Form edit site"
        showClose={false}
      >
        <SiteForm
          siteName={site?.name}
          linkAccess={site?.linkAccess}
          serviceAccount={site?.serviceAccount}
          defaultIssuer={site?.defaultIssuer}
          ha={site?.ha}
          show={visibleModalPros}
          resourceVersion={site?.resourceVersion}
          onCancel={handleClose}
        />
      </Modal>
    </>
  );
};

export default Details;
